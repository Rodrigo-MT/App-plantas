import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationType, SunlightLevel, HumidityLevel } from './dto/create-location.dto';

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
            type: LocationType.INDOOR,
            sunlight: SunlightLevel.PARTIAL,
            humidity: HumidityLevel.MEDIUM,
            description: 'Ambiente interno com luz indireta',
            photo: 'https://example.com/sala-estar.jpg',
          },
          {
            name: 'Jardim',
            type: LocationType.GARDEN,
            sunlight: SunlightLevel.FULL,
            humidity: HumidityLevel.HIGH,
            description: 'Área externa com sol direto',
            photo: 'https://example.com/jardim.jpg',
          },
          {
            name: 'Varanda',
            type: LocationType.BALCONY,
            sunlight: SunlightLevel.PARTIAL,
            humidity: HumidityLevel.MEDIUM,
            description: 'Varanda com luz solar da manhã',
            photo: 'https://example.com/varanda.jpg',
          },
          {
            name: 'Terraço',
            type: LocationType.TERRACE,
            sunlight: SunlightLevel.FULL,
            humidity: HumidityLevel.LOW,
            description: 'Terraço exposto ao sol',
            photo: 'https://example.com/terrace.jpg',
          },
          {
            name: 'Quintal',
            type: LocationType.OUTDOOR,
            sunlight: SunlightLevel.SHADE,
            humidity: HumidityLevel.HIGH,
            description: 'Área sombreada do quintal',
            photo: 'https://example.com/quintal.jpg',
          },
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
   * Cria uma nova localização no sistema com validações contextuais
   */
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { name, type, sunlight, humidity, description, photo } = createLocationDto;

    // 🧠 Validações de negócio
    if (!name?.trim()) throw new BadRequestException('O nome do local é obrigatório.');
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/.test(name)) {
      throw new BadRequestException('O nome do local não pode conter caracteres especiais.');
    }

    if (!Object.values(LocationType).includes(type)) {
      throw new BadRequestException('Tipo de local inválido.');
    }

    if (!Object.values(SunlightLevel).includes(sunlight)) {
      throw new BadRequestException('Nível de luz inválido.');
    }

    if (!Object.values(HumidityLevel).includes(humidity)) {
      throw new BadRequestException('Nível de umidade inválido.');
    }

    if (!description?.trim()) throw new BadRequestException('A descrição é obrigatória.');
    if (description.length > 500) throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');

    if (photo && !/^https?:\/\/.+/.test(photo)) {
      throw new BadRequestException('Anexo de imagem inválido.');
    }

    try {
      const location = this.locationsRepository.create(createLocationDto);
      return await this.locationsRepository.save(location);
    } catch (error) {
      throw new BadRequestException('Erro ao criar localização: ' + error.message);
    }
  }

  /**
   * Atualiza os dados de uma localização existente com validações contextuais
   */
  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);
    const { name, type, sunlight, humidity, description, photo } = updateLocationDto;

    // 🧠 Valida apenas os campos enviados
    if (name !== undefined) {
      if (!name?.trim()) throw new BadRequestException('O nome do local não pode ser vazio.');
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/.test(name)) {
        throw new BadRequestException('O nome do local não pode conter caracteres especiais.');
      }
      location.name = name;
    }

    if (type !== undefined) {
      if (!Object.values(LocationType).includes(type)) {
        throw new BadRequestException('Tipo de local inválido.');
      }
      location.type = type;
    }

    if (sunlight !== undefined) {
      if (!Object.values(SunlightLevel).includes(sunlight)) {
        throw new BadRequestException('Nível de luz inválido.');
      }
      location.sunlight = sunlight;
    }

    if (humidity !== undefined) {
      if (!Object.values(HumidityLevel).includes(humidity)) {
        throw new BadRequestException('Nível de umidade inválido.');
      }
      location.humidity = humidity;
    }

    if (description !== undefined) {
      if (!description?.trim()) throw new BadRequestException('A descrição não pode ser vazia.');
      if (description.length > 500) throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');
      location.description = description;
    }

    if (photo !== undefined) {
      if (photo && !/^https?:\/\/.+/.test(photo)) {
        throw new BadRequestException('Imagem inválida.');
      }
      location.photo = photo;
    }

    try {
      return await this.locationsRepository.save(location);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar localização: ' + error.message);
    }
  }

  /**
   * Retorna todas as localizações
   */
  async findAll(): Promise<Location[]> {
    return await this.locationsRepository.find({ order: { name: 'ASC' } });
  }

  /**
   * Busca uma localização específica pelo ID
   */
  async findOne(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    return location;
  }

  /**
   * Busca localizações por tipo de ambiente
   */
  async findByType(type: string): Promise<Location[]> {
    return await this.locationsRepository.find({ where: { type }, order: { name: 'ASC' } });
  }

  /**
   * Busca localizações por nível de luz solar
   */
  async findBySunlight(sunlight: string): Promise<Location[]> {
    return await this.locationsRepository.find({ where: { sunlight }, order: { name: 'ASC' } });
  }

  /**
   * Remove uma localização do sistema
   */
  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);

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
    if (result.affected === 0) throw new NotFoundException(`Localização com ID ${id} não encontrada`);
  }

  /**
   * Estatísticas de localizações
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
   */
  async isEmpty(id: string): Promise<boolean> {
    const plantsCount = await this.locationsRepository
      .createQueryBuilder('location')
      .leftJoin('location.plants', 'plant')
      .where('location.id = :id', { id })
      .select('COUNT(plant.id)', 'count')
      .getRawOne();

    if (!plantsCount) throw new NotFoundException(`Localização com ID ${id} não encontrada`);
    return parseInt(plantsCount.count) === 0;
  }

  /**
   * Contagem total de localizações no sistema
   */
  async getTotalCount(): Promise<number> {
    return await this.locationsRepository.count();
  }
}
