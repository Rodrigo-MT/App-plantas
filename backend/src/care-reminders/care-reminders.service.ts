import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareReminder } from './entities/care-reminder.entity';
import { CreateCareReminderDto } from './dto/create-care-reminder.dto';
import { UpdateCareReminderDto } from './dto/update-care-reminder.dto';

@Injectable()
export class CareRemindersService {
  constructor(
    @InjectRepository(CareReminder)
    private careRemindersRepository: Repository<CareReminder>,
  ) {}

  /**
   * Cria um novo lembrete de cuidado
   * @param createCareReminderDto Dados para criação do lembrete
   * @returns Lembrete criado
   */
  async create(createCareReminderDto: CreateCareReminderDto): Promise<CareReminder> {
    try {
      const reminder = this.careRemindersRepository.create({
        ...createCareReminderDto,
        nextDue: new Date(createCareReminderDto.nextDue), // Converte string para Date
      });
      return await this.careRemindersRepository.save(reminder);
    } catch (error) {
      throw new BadRequestException('Erro ao criar lembrete: ' + error.message);
    }
  }

  /**
   * Retorna todos os lembretes com suas relações
   * @returns Lista de lembretes com planta associada
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
      where: { plant: { id: plantId } },
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
   * Atualiza os dados de um lembrete existente
   * @param id UUID do lembrete a ser atualizado
   * @param updateCareReminderDto Dados parciais para atualização
   * @returns Lembrete atualizado
   */
  async update(id: string, updateCareReminderDto: UpdateCareReminderDto): Promise<CareReminder> {
    const reminder = await this.findOne(id); // Valida se o lembrete existe
    
    try {
      const updateData: any = { ...updateCareReminderDto };
      
      // Converte nextDue de string para Date se fornecido
      if (updateCareReminderDto.nextDue) {
        updateData.nextDue = new Date(updateCareReminderDto.nextDue);
      }
      
      const updated = this.careRemindersRepository.merge(reminder, updateData);
      return await this.careRemindersRepository.save(updated);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar lembrete: ' + error.message);
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
   * Busca lembretes atrasados (com nextDue no passado)
   * @returns Lembretes atrasados e ativos
   */
  async findOverdue(): Promise<CareReminder[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas datas

    return await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.nextDue < :today', { today })
      .andWhere('reminder.isActive = :isActive', { isActive: true })
      .orderBy('reminder.nextDue', 'ASC')
      .getMany();
  }

  /**
   * Busca lembretes próximos (em até 3 dias)
   * @returns Lembretes próximos do vencimento
   */
  async findUpcoming(): Promise<CareReminder[]> {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    return await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.nextDue BETWEEN :today AND :future', {
        today,
        future: threeDaysFromNow,
      })
      .andWhere('reminder.isActive = :isActive', { isActive: true })
      .orderBy('reminder.nextDue', 'ASC')
      .getMany();
  }
}