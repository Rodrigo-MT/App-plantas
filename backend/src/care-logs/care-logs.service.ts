import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CareLog } from './entities/care-log.entity';
import { CreateCareLogDto } from './dto/create-care-log.dto';
import { UpdateCareLogDto } from './dto/update-care-log.dto';
import { Plant } from '../plants/entities/plant.entity';

@Injectable()
export class CareLogsService {
  constructor(
    @InjectRepository(CareLog)
    private readonly careLogsRepository: Repository<CareLog>,

    @InjectRepository(Plant)
    private readonly plantsRepository: Repository<Plant>, // 🔹 Injeta repositório de plantas
  ) {}

  /**
   * Cria um novo log de cuidado
   */
  async create(createCareLogDto: CreateCareLogDto): Promise<CareLog> {
    const { plantId, type, date, notes } = createCareLogDto;

    // 🔹 Regras de negócio e validações
    if (!plantId) throw new BadRequestException('A planta é obrigatória.');
    if (!type) throw new BadRequestException('O tipo de cuidado é obrigatório.');
    if (!date) throw new BadRequestException('A data do cuidado é obrigatória.');

    // 🔹 Verifica se a planta existe
    const plant = await this.plantsRepository.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new NotFoundException(`Planta com ID ${plantId} não encontrada.`);
    }

    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate > today) {
      throw new BadRequestException('A data do cuidado não pode ser no futuro.');
    }

    if (!notes || notes.trim().length === 0) {
      throw new BadRequestException('O campo de observações é obrigatório.');
    }

    if (notes.length > 500) {
      throw new BadRequestException('As observações devem ter no máximo 500 caracteres.');
    }

    try {
      const careLog = this.careLogsRepository.create({
        ...createCareLogDto,
        plant,
        date: parsedDate,
      });

      return await this.careLogsRepository.save(careLog);
    } catch (error) {
      throw new BadRequestException('Erro ao criar log de cuidado: ' + error.message);
    }
  }

  /**
   * Retorna todos os logs
   */
  async findAll(): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca logs por planta
   */
  async findByPlantId(plantId: string): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { plantId },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca logs por tipo
   */
  async findByType(type: string): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { type },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca logs por intervalo de tempo
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { date: Between(startDate, endDate) },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Busca log por ID
   */
  async findOne(id: string): Promise<CareLog> {
    const careLog = await this.careLogsRepository.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!careLog) {
      throw new NotFoundException(`Log de cuidado com ID ${id} não encontrado.`);
    }

    return careLog;
  }

  /**
   * Atualiza log existente
   */
  async update(id: string, updateCareLogDto: UpdateCareLogDto): Promise<CareLog> {
    const existing = await this.findOne(id);

    if (updateCareLogDto.plantId) {
      const plant = await this.plantsRepository.findOne({
        where: { id: updateCareLogDto.plantId },
      });
      if (!plant) {
        throw new NotFoundException(`Planta com ID ${updateCareLogDto.plantId} não encontrada.`);
      }
      existing.plant = plant;
    }

    if (updateCareLogDto.date) {
      const parsedDate = new Date(updateCareLogDto.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (parsedDate > today) {
        throw new BadRequestException('A data do cuidado não pode ser no futuro.');
      }

      existing.date = parsedDate;
    }

    if (updateCareLogDto.notes && updateCareLogDto.notes.length > 500) {
      throw new BadRequestException('O campo de observações deve ter no máximo 500 caracteres.');
    }

    try {
      const updated = this.careLogsRepository.merge(existing, updateCareLogDto);
      return await this.careLogsRepository.save(updated);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar log de cuidado: ' + error.message);
    }
  }

  /**
   * Remove log
   */
  async remove(id: string): Promise<void> {
    const result = await this.careLogsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Log de cuidado com ID ${id} não encontrado.`);
    }
  }

  /**
   * Estatísticas de cuidados por tipo
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
   * Logs dos últimos 30 dias
   */
  async findRecent(): Promise<CareLog[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.careLogsRepository.find({
      where: { date: Between(thirtyDaysAgo, new Date()) },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Logs bem-sucedidos
   */
  async findSuccessful(): Promise<CareLog[]> {
    return await this.careLogsRepository.find({
      where: { success: true },
      relations: ['plant'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Contagem total
   */
  async getTotalCount(): Promise<number> {
    return await this.careLogsRepository.count();
  }
}
