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
        purchaseDate: new Date(createPlantDto.purchaseDate), // Converte string para Date
      });
      return await this.plantsRepository.save(plant);
    } catch (error) {
      throw new BadRequestException('Erro ao criar planta: ' + error.message);
    }
  }

  /**
   * Retorna todas as plantas
   * @returns Lista de plantas
   */
  async findAll(): Promise<Plant[]> {
    return await this.plantsRepository.find({
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
      where: { locationId },
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
      where: { speciesId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca plantas compradas em um período específico
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Plantas compradas no período
   */
  async findByPurchaseDateRange(startDate: Date, endDate: Date): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: {
        purchaseDate: Between(startDate, endDate),
      },
      order: { purchaseDate: 'DESC' },
    });
  }

  /**
   * Busca uma planta específica pelo ID
   * @param id UUID da planta
   * @returns Planta encontrada
   * @throws NotFoundException se a planta não existir
   */
  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantsRepository.findOne({
      where: { id },
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
      
      // Converte purchaseDate de string para Date se fornecido
      if (updatePlantDto.purchaseDate) {
        updateData.purchaseDate = new Date(updatePlantDto.purchaseDate);
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
   * Estatísticas de plantas por localização
   * @returns Contagem de plantas por localização
   */
  async getLocationStats(): Promise<{ locationId: string; count: number }[]> {
    return await this.plantsRepository
      .createQueryBuilder('plant')
      .select('plant.locationId', 'locationId')
      .addSelect('COUNT(plant.id)', 'count')
      .groupBy('plant.locationId')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  /**
   * Contagem total de plantas no sistema
   * @returns Número total de plantas
   */
  async getTotalCount(): Promise<number> {
    return await this.plantsRepository.count();
  }
}