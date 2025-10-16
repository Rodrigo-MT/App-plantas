import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  /**
   * Executado automaticamente quando o módulo é inicializado
   */
  async onModuleInit() {
    await this.seedDefaultLocations();
  }

  /**
   * Cria localizações padrão se não existirem
   */
  private async seedDefaultLocations(): Promise<void> {
    try {
      const existingCount = await this.locationsRepository.count();
      
      if (existingCount === 0) {
        console.log('🌱 Creating default locations...');
        
        const defaultLocations = [
          {
            name: 'Sala de Estar',
            type: 'indoor',
            sunlight: 'partial',
            humidity: 'medium',
            description: 'Ambiente interno com luz indireta',
            photo: 'https://example.com/sala-estar.jpg',
          },
          {
            name: 'Jardim',
            type: 'garden',
            sunlight: 'full',
            humidity: 'high',
            description: 'Área externa com sol direto',
            photo: 'https://example.com/jardim.jpg',
          },
          {
            name: 'Varanda',
            type: 'balcony',
            sunlight: 'partial',
            humidity: 'medium',
            description: 'Varanda com luz solar da manhã',
            photo: 'https://example.com/varanda.jpg',
          },
          {
            name: 'Terraço',
            type: 'terrace',
            sunlight: 'full',
            humidity: 'low',
            description: 'Terraço exposto ao sol',
            photo: 'https://example.com/terrace.jpg',
          },
          {
            name: 'Quintal',
            type: 'outdoor',
            sunlight: 'shade',
            humidity: 'high',
            description: 'Área sombreada do quintal',
            photo: 'https://example.com/quintal.jpg',
          }
        ];

        const locationsToCreate = this.locationsRepository.create(defaultLocations);
        await this.locationsRepository.save(locationsToCreate);
        
        console.log(`✅ Created ${locationsToCreate.length} default locations`);
      } else {
        console.log(`✅ Locations already exist in database (${existingCount} records)`);
      }
    } catch (error) {
      console.error('❌ Error creating default locations:', error);
    }
  }

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
   * Retorna todas as localizações
   * @returns Lista de localizações
   */
  async findAll(): Promise<Location[]> {
    return await this.locationsRepository.find({
      order: { name: 'ASC' }, // Ordena por nome alfabeticamente
    });
  }

  /**
   * Busca uma localização específica pelo ID
   * @param id UUID da localização
   * @returns Localização encontrada
   * @throws NotFoundException se a localização não existir
   */
  async findOne(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    }

    return location;
  }

  /**
   * Busca localizações por tipo de ambiente
   * @param type Tipo de ambiente (indoor, outdoor, balcony, garden, terrace)
   * @returns Lista de localizações do tipo especificado
   */
  async findByType(type: string): Promise<Location[]> {
    return await this.locationsRepository.find({
      where: { type },
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca localizações por nível de luz solar
   * @param sunlight Nível de luz solar (full, partial, shade)
   * @returns Lista de localizações com o nível de luz especificado
   */
  async findBySunlight(sunlight: string): Promise<Location[]> {
    return await this.locationsRepository.find({
      where: { sunlight },
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
    const location = await this.findOne(id);
    
    // Verifica se a localização tem plantas associadas
    const plantsCount = await this.locationsRepository
      .createQueryBuilder('location')
      .leftJoin('location.plants', 'plant')
      .where('location.id = :id', { id })
      .select('COUNT(plant.id)', 'count')
      .getRawOne();

    if (parseInt(plantsCount.count) > 0) {
      throw new BadRequestException(
        `Não é possível remover a localização '${location.name}' pois existem ${plantsCount.count} plantas associadas a ela.`
      );
    }

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
    const plantsCount = await this.locationsRepository
      .createQueryBuilder('location')
      .leftJoin('location.plants', 'plant')
      .where('location.id = :id', { id })
      .select('COUNT(plant.id)', 'count')
      .getRawOne();

    if (!plantsCount) {
      throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    }

    return parseInt(plantsCount.count) === 0;
  }

  /**
   * Contagem total de localizações no sistema
   * @returns Número total de localizações
   */
  async getTotalCount(): Promise<number> {
    return await this.locationsRepository.count();
  }
}