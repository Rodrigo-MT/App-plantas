import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CareLog } from './entities/care-log.entity';
import { CreateCareLogDto } from './dto/create-care-log.dto';
import { UpdateCareLogDto } from './dto/update-care-log.dto';

@Injectable()
export class CareLogsService {
  constructor(
    @InjectRepository(CareLog)
    private careLogsRepository: Repository<CareLog>,
  ) {}

  /**
   * Cria um novo log de cuidado
   * @param createCareLogDto Dados para criação do log
   * @returns Log criado
   */
  async create(createCareLogDto: CreateCareLogDto): Promise<CareLog> {
    try {
      const careLog = this.careLogsRepository.create(createCareLogDto);
      return await this.careLogsRepository.save(careLog);
    } catch (error) {
      throw new BadRequestException('Erro ao criar log de cuidado: ' + error.message);
    }
  }

  /**
   * Retorna todos os logs com suas relações
   * @returns Lista de logs com planta associada
   */
  async findAll(): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      relations: ['plant'],
      order: { performedAt: 'DESC' }, // Ordena do mais recente para o mais antigo
    });
  }

  /**
   * Busca logs por planta específica
   * @param plantId ID da planta
   * @returns Logs da planta
   */
  async findByPlantId(plantId: string): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { plant: { id: plantId } },
      relations: ['plant'],
      order: { performedAt: 'DESC' },
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
        performedAt: Between(startDate, endDate),
      },
      relations: ['plant'],
      order: { performedAt: 'DESC' },
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
   * Atualiza os dados de um log existente
   * @param id UUID do log a ser atualizado
   * @param updateCareLogDto Dados parciais para atualização
   * @returns Log atualizado
   */
  async update(id: string, updateCareLogDto: UpdateCareLogDto): Promise<CareLog> {
    const careLog = await this.findOne(id); // Valida se o log existe
    
    try {
      const updated = this.careLogsRepository.merge(careLog, updateCareLogDto);
      return await this.careLogsRepository.save(updated);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar log de cuidado: ' + error.message);
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
}