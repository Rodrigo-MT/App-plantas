import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  /**
   * Cria uma nova localização no sistema
   * @param createLocationDto Dados para criação da localização
   * @returns Localização criada
   */
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    try {
      const location = this.locationsRepository.create(createLocationDto);
      return await this.locationsRepository.save(location);
    } catch (error) {
      throw new BadRequestException('Erro ao criar localização: ' + error.message);
    }
  }

  /**
   * Retorna todas as localizações com suas relações
   * @returns Lista de localizações com plantas associadas
   */
  async findAll(): Promise<Location[]> {
    return await this.locationsRepository.find({
      relations: ['plants'],
      order: { name: 'ASC' }, // Ordena por nome alfabeticamente
    });
  }

  /**
   * Busca uma localização específica pelo ID
   * @param id UUID da localização
   * @returns Localização encontrada com plantas associadas
   * @throws NotFoundException se a localização não existir
   */
  async findOne(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({
      where: { id },
      relations: ['plants'],
    });

    if (!location) {
      throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    }

    return location;
  }

  /**
   * Busca localizações por tipo de ambiente
   * @param type Tipo de ambiente (indoor, outdoor, greenhouse)
   * @returns Lista de localizações do tipo especificado
   */
  async findByType(type: string): Promise<Location[]> {
    return await this.locationsRepository.find({
      where: { type },
      relations: ['plants'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Atualiza os dados de uma localização existente
   * @param id UUID da localização a ser atualizada
   * @param updateLocationDto Dados parciais para atualização
   * @returns Localização atualizada
   */
  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id); // Valida se a localização existe
    
    try {
      const updated = this.locationsRepository.merge(location, updateLocationDto);
      return await this.locationsRepository.save(updated);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar localização: ' + error.message);
    }
  }

  /**
   * Remove uma localização do sistema
   * @param id UUID da localização a ser removida
   * @throws NotFoundException se a localização não existir
   */
  async remove(id: string): Promise<void> {
    const result = await this.locationsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    }
  }

  /**
   * Estatísticas de localizações
   * @returns Contagem de plantas por localização
   */
  async getLocationStats(): Promise<{ locationId: string; locationName: string; plantCount: number }[]> {
    return await this.locationsRepository
      .createQueryBuilder('location')
      .leftJoin('location.plants', 'plant')
      .select('location.id', 'locationId')
      .addSelect('location.name', 'locationName')
      .addSelect('COUNT(plant.id)', 'plantCount')
      .groupBy('location.id')
      .addGroupBy('location.name')
      .orderBy('plantCount', 'DESC')
      .getRawMany();
  }

  /**
   * Verifica se uma localização está vazia (sem plantas)
   * @param id UUID da localização
   * @returns true se a localização não tiver plantas
   */
  async isEmpty(id: string): Promise<boolean> {
    const location = await this.locationsRepository.findOne({
      where: { id },
      relations: ['plants'],
    });

    if (!location) {
      throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    }

    return location.plants.length === 0;
  }
}