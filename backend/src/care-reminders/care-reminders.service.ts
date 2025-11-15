import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareReminder } from './entities/care-reminder.entity';
import { CreateCareReminderDto } from './dto/create-care-reminder.dto';
import { UpdateCareReminderDto } from './dto/update-care-reminder.dto';
import { PlantsService } from '../plants/plants.service';
import { parseYMDToLocalDate } from '../common/utils/date.utils';

@Injectable()
export class CareRemindersService {
  constructor(
    @InjectRepository(CareReminder)
    private careRemindersRepository: Repository<CareReminder>,
    private plantsService: PlantsService,
  ) {}

  /**
   * Cria um novo lembrete de cuidado
   * @param createCareReminderDto Dados para criação do lembrete
   * @returns Lembrete criado
   */
  async create(createCareReminderDto: CreateCareReminderDto): Promise<CareReminder> {
    // Validações de negócio
    try {
      const { plantName, type, frequency, lastDone, nextDue, notes, isActive } = createCareReminderDto as any;

      if (!plantName?.trim()) {
        throw new BadRequestException('O nome da planta é obrigatório.');
      }

      if (!type) {
        throw new BadRequestException('O tipo do lembrete é obrigatório.');
      }

      if (frequency === undefined || frequency === null || typeof frequency !== 'number' || frequency <= 0 || frequency > 99) {
        throw new BadRequestException('A frequência deve ser um número inteiro positivo entre 1 e 99.');
      }

      if (!lastDone) {
        throw new BadRequestException('A data da última execução é obrigatória.');
      }
      if (!nextDue) {
        throw new BadRequestException('A data do próximo vencimento é obrigatória.');
      }

      const lastDoneDateParsed = parseYMDToLocalDate(lastDone);
      const nextDueDateParsed = parseYMDToLocalDate(nextDue);
      if (!lastDoneDateParsed) {
        throw new BadRequestException('Data de última execução inválida.');
      }
      if (!nextDueDateParsed) {
        throw new BadRequestException('Data de próximo vencimento inválida.');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Normaliza
      const ld = lastDoneDateParsed;
      const nd = nextDueDateParsed;
      ld.setHours(0, 0, 0, 0);
      nd.setHours(0, 0, 0, 0);

      // lastDone não pode ser futuro (apenas hoje ou passado)
      if (ld.getTime() > today.getTime()) {
        throw new BadRequestException('A data da última execução não pode ser futura.');
      }

      // nextDue deve ser futura (apenas futuro estrito)
      if (nd.getTime() <= today.getTime()) {
        throw new BadRequestException('A próxima data deve ser futura (maior que hoje).');
      }

      // nextDue também deve ser após lastDone
      if (nd.getTime() <= ld.getTime()) {
        throw new BadRequestException('A data do próximo vencimento deve ser posterior à última execução.');
      }

      if (!notes?.trim()) {
        throw new BadRequestException('O campo observações é obrigatório.');
      }
      if (notes && notes.length > 500) {
        throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
      }

      // Resolve plantName -> plantId
      const plant = await this.plantsService.findByName(plantName);
      if (!plant) throw new BadRequestException(`Planta '${plantName}' não encontrada`);

      // Regra de unicidade: não pode existir reminder com mesmo plantId + type + nextDue (comparação por string YYYY-MM-DD para evitar offset timezone)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const nextDueYMD = `${nd.getFullYear()}-${pad(nd.getMonth() + 1)}-${pad(nd.getDate())}`;
      const existing = await this.careRemindersRepository
        .createQueryBuilder('reminder')
        .where('reminder.plantId = :plantId', { plantId: plant.id })
        .andWhere('reminder.type = :type', { type })
        .andWhere('reminder.nextDue = :nextDue', { nextDue: nextDueYMD })
        .getOne();

      if (existing) {
        throw new BadRequestException(`Lembrete para planta '${plantName}', tipo '${type}' e data '${nextDue}' já existe`);
      }

      const reminder = this.careRemindersRepository.create({
        plantId: plant.id,
        type,
        frequency,
        lastDone: ld,
        nextDue: nd,
        notes,
        isActive,
      });

      return await this.careRemindersRepository.save(reminder);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao criar lembrete: ' + (error?.message || String(error)));
    }
  }

  /**
   * Retorna todos os lembretes
   * @returns Lista de lembretes
   */
  async findAll(): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      relations: ['plant'],
      order: { nextDue: 'ASC' }, // Ordena por data de vencimento
    });
  }

  /**
   * Busca lembretes por planta específica
   * @param plantId ID da planta
   * @returns Lembretes da planta
   */
  async findByPlantId(plantId: string): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      where: { plantId },
      relations: ['plant'],
      order: { nextDue: 'ASC' },
    });
  }

  /**
   * Busca lembretes por nome da planta
   * @param plantName Nome da planta
   */
  async findByPlantName(plantName: string): Promise<CareReminder[]> {
    const plant = await this.plantsService.findByName(plantName);
    if (!plant) return [];
    return this.findByPlantId(plant.id);
  }

  /**
   * Busca lembretes por tipo
   * @param type Tipo de cuidado
   * @returns Lembretes do tipo especificado
   */
  async findByType(type: string): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      where: { type },
      relations: ['plant'],
      order: { nextDue: 'ASC' },
    });
  }

  /**
   * Busca um lembrete específico pelo ID
   * @param id UUID do lembrete
   * @returns Lembrete encontrado
   * @throws NotFoundException se o lembrete não existir
   */
  async findOne(id: string): Promise<CareReminder> {
    const reminder = await this.careRemindersRepository.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!reminder) {
      throw new NotFoundException(`Lembrete com ID ${id} não encontrado`);
    }

    return reminder;
  }

  /**
   * Busca um lembrete específico pelo identificador composto plantName+type+nextDue
   */
  async findOneByComposite(plantName: string, type: string, nextDue: string): Promise<CareReminder> {
    const plant = await this.plantsService.findByName(plantName);
    if (!plant) throw new NotFoundException(`Planta '${plantName}' não encontrada`);
    // Valida formato da data
    const parsed = parseYMDToLocalDate(nextDue);
    if (!parsed) throw new NotFoundException(`Lembrete para planta '${plantName}', tipo '${type}' e data '${nextDue}' não encontrado`);
    // Busca usando comparação direta por string (evita diferença de fuso ao transformar Date)
    const reminder = await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.plantId = :plantId', { plantId: plant.id })
      .andWhere('reminder.type = :type', { type })
      .andWhere('reminder.nextDue = :nextDue', { nextDue })
      .getOne();
    if (!reminder) throw new NotFoundException(`Lembrete para planta '${plantName}', tipo '${type}' e data '${nextDue}' não encontrado`);
    return reminder;
  }

  /**
   * Atualiza os dados de um lembrete existente
   * @param id UUID do lembrete a ser atualizado
   * @param updateCareReminderDto Dados parciais para atualização
   * @returns Lembrete atualizado
   */
  async update(id: string, updateCareReminderDto: UpdateCareReminderDto): Promise<CareReminder> {
    const reminder = await this.findOne(id); // Valida se o lembrete existe
    
    try {
      // Bloqueia alterações nos campos do identificador composto
      const forbiddenKeys = ['plantName', 'type', 'nextDue'];
      for (const key of forbiddenKeys) {
        if (Object.prototype.hasOwnProperty.call(updateCareReminderDto as any, key)) {
          throw new BadRequestException('Não é permitido alterar plantName, type ou nextDue em PATCH. Crie um novo lembrete se precisar modificar esses campos.');
        }
      }

      const updateData: any = { ...updateCareReminderDto };

      // Se fornecer plantName, resolve para plantId
      // (Imutável) plantName não pode ser atualizado

      // Valida frequência se fornecida
      if (updateCareReminderDto.frequency !== undefined) {
        if (typeof updateCareReminderDto.frequency !== 'number' || updateCareReminderDto.frequency <= 0 || updateCareReminderDto.frequency > 99) {
          throw new BadRequestException('A frequência deve ser um número inteiro positivo entre 1 e 99.');
        }
      }

      // Converte datas de string para Date se fornecidas e valida
      if (updateCareReminderDto.lastDone !== undefined) {
        if (!updateCareReminderDto.lastDone) throw new BadRequestException('A data da última execução não pode ser vazia.');
        const ld = new Date(updateCareReminderDto.lastDone);
        if (isNaN(ld.getTime())) throw new BadRequestException('Data de última execução inválida.');
        ld.setHours(0, 0, 0, 0);
        const today = new Date(); today.setHours(0,0,0,0);
        if (ld.getTime() > today.getTime()) throw new BadRequestException('A data da última execução não pode ser futura.');
        updateData.lastDone = ld;
      }
      // (Imutável) nextDue não pode ser atualizado

      if (updateCareReminderDto.notes !== undefined) {
        if (!updateCareReminderDto.notes?.trim()) {
          throw new BadRequestException('O campo observações não pode ser vazio.');
        }
        if (updateCareReminderDto.notes.length > 500) {
          throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
        }
      }

      // Se alterar plantId/type/nextDue, verificar unicidade
      // (Sem verificação de unicidade aqui porque identificador composto é imutável no PATCH)

      const updated = this.careRemindersRepository.merge(reminder, updateData);
      return await this.careRemindersRepository.save(updated);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao atualizar lembrete: ' + (error?.message || String(error)));
    }
  }

  /**
   * Remove um lembrete do sistema
   * @param id UUID do lembrete a ser removido
   * @throws NotFoundException se o lembrete não existir
   */
  async remove(id: string): Promise<void> {
    const result = await this.careRemindersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Lembrete com ID ${id} não encontrado`);
    }
  }

  /**
   * Remove um lembrete pelo identificador composto (plantName+type+nextDue)
   */
  async removeByComposite(plantName: string, type: string, nextDue: string): Promise<void> {
    const reminder = await this.findOneByComposite(plantName, type, nextDue);
    await this.remove(reminder.id);
  }

  /**
   * Busca lembretes atrasados (com nextDue no passado)
   * @returns Lembretes atrasados e ativos
   */
  async findOverdue(): Promise<CareReminder[]> {
    // Overdue segundo novo requisito: lembretes cuja última realização (lastDone)
    // foi em dia passado ou hoje: lastDone <= hoje. Mantém apenas ativos.
    // Usa comparação por string YYYY-MM-DD para evitar problemas de timezone.
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const todayYMD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    return await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.lastDone <= :today', { today: todayYMD })
      .andWhere('reminder.isActive = :isActive', { isActive: true })
      .orderBy('reminder.lastDone', 'ASC')
      .getMany();
  }

  /**
   * Busca lembretes próximos (em até 3 dias)
   * @returns Lembretes próximos do vencimento
   */
  async findUpcoming(): Promise<CareReminder[]> {
    // Lembretes futuros (exclui hoje): nextDue > hoje usando data pura YYYY-MM-DD
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const todayYMD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    return await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.nextDue > :today', { today: todayYMD })
      .andWhere('reminder.isActive = :isActive', { isActive: true })
      .orderBy('reminder.nextDue', 'ASC')
      .getMany();
  }

  // mark-done removido a pedido do usuário; manter lógica simples via update quando necessário

  /**
   * Busca lembretes ativos
   * @returns Lembretes ativos
   */
  async findActive(): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      where: { isActive: true },
      relations: ['plant'],
      order: { nextDue: 'ASC' },
    });
  }

  /**
   * Contagem total de lembretes no sistema
   * @returns Número total de lembretes
   */
  async getTotalCount(): Promise<number> {
    return await this.careRemindersRepository.count();
  }
}