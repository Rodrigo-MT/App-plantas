import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Plant } from './entities/plant.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantsService {
  constructor(
    @InjectRepository(Plant)
    private plantsRepository: Repository<Plant>,
  ) {}

  /**
   * Cria uma nova planta no sistema
   * @param createPlantDto Dados para criação da planta
   * @returns Planta criada
   */
  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    try {
      const plant = this.plantsRepository.create({
        ...createPlantDto,
        plantingDate: new Date(createPlantDto.plantingDate), // Converte string para Date
      });
      return await this.plantsRepository.save(plant);
    } catch (error) {
      throw new BadRequestException('Erro ao criar planta: ' + error.message);
    }
  }

  /**
   * Retorna todas as plantas com suas relações
   * @returns Lista de plantas com espécie e localização
   */
  async findAll(): Promise<Plant[]> {
    return await this.plantsRepository.find({
      relations: ['species', 'location'],
      order: { name: 'ASC' }, // Ordena por nome alfabeticamente
    });
  }

  /**
   * Busca plantas por localização específica
   * @param locationId ID da localização
   * @returns Plantas da localização especificada
   */
  async findByLocation(locationId: string): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: { location: { id: locationId } },
      relations: ['species', 'location'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca plantas por espécie específica
   * @param speciesId ID da espécie
   * @returns Plantas da espécie especificada
   */
  async findBySpecies(speciesId: string): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: { species: { id: speciesId } },
      relations: ['species', 'location'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca plantas por status de saúde
   * @param healthStatus Status de saúde (healthy, needs_care, sick)
   * @returns Plantas com o status especificado
   */
  async findByHealthStatus(healthStatus: string): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: { healthStatus },
      relations: ['species', 'location'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca plantas plantadas em um período específico
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Plantas plantadas no período
   */
  async findByPlantingDateRange(startDate: Date, endDate: Date): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: {
        plantingDate: Between(startDate, endDate),
      },
      relations: ['species', 'location'],
      order: { plantingDate: 'DESC' },
    });
  }

  /**
   * Busca uma planta específica pelo ID
   * @param id UUID da planta
   * @returns Planta encontrada com todas as relações
   * @throws NotFoundException se a planta não existir
   */
  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantsRepository.findOne({
      where: { id },
      relations: ['species', 'location', 'reminders', 'careLogs'],
    });

    if (!plant) {
      throw new NotFoundException(`Planta com ID ${id} não encontrada`);
    }

    return plant;
  }

  /**
   * Atualiza os dados de uma planta existente
   * @param id UUID da planta a ser atualizada
   * @param updatePlantDto Dados parciais para atualização
   * @returns Planta atualizada
   */
  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    const plant = await this.findOne(id); // Valida se a planta existe
    
    try {
      const updateData: any = { ...updatePlantDto };
      
      // Converte plantingDate de string para Date se fornecido
      if (updatePlantDto.plantingDate) {
        updateData.plantingDate = new Date(updatePlantDto.plantingDate);
      }
      
      const updated = this.plantsRepository.merge(plant, updateData);
      return await this.plantsRepository.save(updated);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar planta: ' + error.message);
    }
  }

  /**
   * Remove uma planta do sistema
   * @param id UUID da planta a ser removida
   * @throws NotFoundException se a planta não existir
   */
  async remove(id: string): Promise<void> {
    const result = await this.plantsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Planta com ID ${id} não encontrada`);
    }
  }

  /**
   * Estatísticas de plantas por status de saúde
   * @returns Contagem de plantas por status de saúde
   */
  async getHealthStats(): Promise<{ healthStatus: string; count: number }[]> {
    return await this.plantsRepository
      .createQueryBuilder('plant')
      .select('plant.healthStatus', 'healthStatus')
      .addSelect('COUNT(plant.id)', 'count')
      .groupBy('plant.healthStatus')
      .getRawMany();
  }

  /**
   * Estatísticas de plantas por localização
   * @returns Contagem de plantas por localização
   */
  async getLocationStats(): Promise<{ locationId: string; locationName: string; count: number }[]> {
    return await this.plantsRepository
      .createQueryBuilder('plant')
      .leftJoin('plant.location', 'location')
      .select('location.id', 'locationId')
      .addSelect('location.name', 'locationName')
      .addSelect('COUNT(plant.id)', 'count')
      .groupBy('location.id')
      .addGroupBy('location.name')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  /**
   * Busca plantas que precisam de cuidados (status 'needs_care' ou 'sick')
   * @returns Plantas que necessitam de atenção
   */
  async findPlantsNeedingCare(): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: [
        { healthStatus: 'needs_care' },
        { healthStatus: 'sick' }
      ],
      relations: ['species', 'location'],
      order: { healthStatus: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Atualiza o status de saúde de uma planta
   * @param id UUID da planta
   * @param healthStatus Novo status de saúde
   * @returns Planta atualizada
   */
  async updateHealthStatus(id: string, healthStatus: string): Promise<Plant> {
    const plant = await this.findOne(id);
    
    plant.healthStatus = healthStatus;
    return await this.plantsRepository.save(plant);
  }

  /**
   * Contagem total de plantas no sistema
   * @returns Número total de plantas
   */
  async getTotalCount(): Promise<number> {
    return await this.plantsRepository.count();
  }
}