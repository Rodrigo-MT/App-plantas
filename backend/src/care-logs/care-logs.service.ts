import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CareLog } from './entities/care-log.entity';
import { CreateCareLogDto } from './dto/create-care-log.dto';
import { UpdateCareLogDto } from './dto/update-care-log.dto';
import { PlantsService } from '../plants/plants.service';
import { parseYMDToLocalDate } from '../common/utils/date.utils';

@Injectable()
export class CareLogsService {
  constructor(
    @InjectRepository(CareLog)
    private careLogsRepository: Repository<CareLog>,
    private plantsService: PlantsService,
  ) {}

  /**
   * Cria um novo log de cuidado
   * @param createCareLogDto Dados para criação do log
   * @returns Log criado
   */
  async create(createCareLogDto: CreateCareLogDto): Promise<CareLog> {
    // Validações de negócio
    try {
  const { plantName, type, date: dateStr, notes, photo, success } = createCareLogDto as any;

      if (!plantName?.trim()) {
        throw new BadRequestException('O nome da planta é obrigatório.');
      }
      if (!type) {
        throw new BadRequestException('O tipo do cuidado é obrigatório.');
      }
      if (!dateStr) {
        throw new BadRequestException('A data do cuidado é obrigatória.');
      }

      const date = parseYMDToLocalDate(dateStr);
      if (!date) {
        throw new BadRequestException('Data inválida para o log de cuidado.');
      }

      // Não permitir data futura
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = date;
      d.setHours(0, 0, 0, 0);
      if (d.getTime() > today.getTime()) {
        throw new BadRequestException('A data do log de cuidado não pode ser futura.');
      }

      if (!notes?.trim()) {
        throw new BadRequestException('O campo observações é obrigatório.');
      }
      if (notes && notes.length > 500) {
        throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
      }

      // Allow base64 data URIs or http(s) URLs
      if (photo && typeof photo === 'string' && !(photo.startsWith('data:image/') || photo.startsWith('http'))) {
        throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
      }

      if (typeof success !== 'boolean') {
        throw new BadRequestException('O campo success deve ser booleano.');
      }

      // Resolve plantName -> plantId
      const plant = await this.plantsService.findByName(plantName);
      if (!plant) throw new BadRequestException(`Planta '${plantName}' não encontrada`);

      // Regra de unicidade: não pode existir care-log com mesmo plantId + type + date
      const existing = await this.careLogsRepository.findOne({
        where: { plantId: plant.id, type, date: d },
      });
      if (existing) {
        throw new BadRequestException(`Log para planta '${plantName}', tipo '${type}' e data '${dateStr}' já existe`);
      }

      const careLog = this.careLogsRepository.create({
        plantId: plant.id,
        type,
        date: d,
        notes,
        photo,
        success,
      });

      return await this.careLogsRepository.save(careLog);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao criar log de cuidado: ' + (error?.message || String(error)));
    }
  }

  /**
   * Retorna todos os logs
   * @returns Lista de logs
   */
  async findAll(): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      relations: ['plant'],
      order: { date: 'DESC' }, // Ordena do mais recente para o mais antigo
    });
  }

  /**
   * Busca logs por planta específica
   * @param plantId ID da planta
   * @returns Logs da planta
   */
  async findByPlantId(plantId: string): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { plantId },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca logs por nome da planta
   * @param plantName Nome da planta
   */
  async findByPlantName(plantName: string): Promise<CareLog[]> {
    const plant = await this.plantsService.findByName(plantName);
    if (!plant) return [];
    return this.findByPlantId(plant.id);
  }

  /**
   * Busca logs por tipo
   * @param type Tipo de cuidado
   * @returns Logs do tipo especificado
   */
  async findByType(type: string): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { type },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca logs por período de tempo
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Logs no período especificado
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca um log específico pelo ID
   * @param id UUID do log
   * @returns Log encontrado
   * @throws NotFoundException se o log não existir
   */
  async findOne(id: string): Promise<CareLog> {
    const careLog = await this.careLogsRepository.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!careLog) {
      throw new NotFoundException(`Log de cuidado com ID ${id} não encontrado`);
    }

    return careLog;
  }

  /**
   * Busca um care-log pelo identificador composto plantName+type+date
   */
  async findOneByComposite(plantName: string, type: string, dateStr: string): Promise<CareLog> {
    const plant = await this.plantsService.findByName(plantName);
    if (!plant) throw new NotFoundException(`Planta '${plantName}' não encontrada`);

    const date = parseYMDToLocalDate(dateStr);
    if (!date) throw new NotFoundException(`Log para planta '${plantName}', tipo '${type}' e data '${dateStr}' não encontrado`);
    const careLog = await this.careLogsRepository.findOne({
      where: { plantId: plant.id, type, date },
      relations: ['plant'],
    });

    if (!careLog) throw new NotFoundException(`Log para planta '${plantName}', tipo '${type}' e data '${dateStr}' não encontrado`);
    return careLog;
  }

  /**
   * Atualiza os dados de um log existente
   * @param id UUID do log a ser atualizado
   * @param updateCareLogDto Dados parciais para atualização
   * @returns Log atualizado
   */
  async update(id: string, updateCareLogDto: UpdateCareLogDto): Promise<CareLog> {
    const careLog = await this.findOne(id); // Valida se o log existe
    
    try {
      // Bloqueia alterações nos campos do identificador composto
      const forbiddenKeys = ['plantName', 'type', 'date'];
      for (const key of forbiddenKeys) {
        if (Object.prototype.hasOwnProperty.call(updateCareLogDto as any, key)) {
          throw new BadRequestException('Não é permitido alterar plantName, type ou date em PATCH. Crie um novo log se precisar modificar esses campos.');
        }
      }

      const updateData: any = { ...updateCareLogDto };

      // Se fornecer plantName, resolve para plantId
      // (Imutável) plantName não pode ser atualizado

      // Converte date de string para Date se fornecido e valida
      // (Imutável) date não pode ser atualizado

      if (updateCareLogDto.notes !== undefined) {
        if (!updateCareLogDto.notes?.trim()) {
          throw new BadRequestException('O campo observações não pode ser vazio.');
        }
        if (updateCareLogDto.notes.length > 500) {
          throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
        }
      }

      if (updateCareLogDto.success !== undefined && typeof updateCareLogDto.success !== 'boolean') {
        throw new BadRequestException('O campo success deve ser booleano.');
      }

      // Se alterar plantId/type/date, verificar unicidade
      // (Sem verificação de unicidade aqui porque identificador composto é imutável no PATCH)

      const updated = this.careLogsRepository.merge(careLog, updateData);
      return await this.careLogsRepository.save(updated);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao atualizar log de cuidado: ' + (error?.message || String(error)));
    }
  }

  /**
   * Remove um log do sistema
   * @param id UUID do log a ser removido
   * @throws NotFoundException se o log não existir
   */
  async remove(id: string): Promise<void> {
    const result = await this.careLogsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Log de cuidado com ID ${id} não encontrado`);
    }
  }

  /**
   * Remove um care-log pelo identificador composto (plantName+type+date)
   */
  async removeByComposite(plantName: string, type: string, dateStr: string): Promise<void> {
    const careLog = await this.findOneByComposite(plantName, type, dateStr);
    await this.remove(careLog.id);
  }

  /**
   * Estatísticas de cuidados por tipo
   * @returns Contagem de cuidados por tipo
   */
  async getCareStats(): Promise<{ type: string; count: number }[]> {
    return await this.careLogsRepository
      .createQueryBuilder('careLog')
      .select('careLog.type', 'type')
      .addSelect('COUNT(careLog.id)', 'count')
      .groupBy('careLog.type')
      .getRawMany();
  }

  /**
   * Busca logs recentes (últimos 30 dias)
   * @returns Logs dos últimos 30 dias
   */
  async findRecent(): Promise<CareLog[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.careLogsRepository.find({
      where: {
        date: Between(thirtyDaysAgo, new Date()),
      },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca logs bem-sucedidos
   * @returns Logs com sucesso = true
   */
  async findSuccessful(): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { success: true },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Contagem total de logs no sistema
   * @returns Número total de logs
   */
  async getTotalCount(): Promise<number> {
    return await this.careLogsRepository.count();
  }
}