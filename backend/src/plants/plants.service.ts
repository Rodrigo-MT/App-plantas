import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { Plant } from './entities/plant.entity';
import { CareReminder } from '../care-reminders/entities/care-reminder.entity';
import { CareLog } from '../care-logs/entities/care-log.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { SpeciesService } from '../species/species.service';
import { LocationsService } from '../locations/locations.service';
import { parseYMDToLocalDate } from '../common/utils/date.utils';

@Injectable()
export class PlantsService {
  constructor(
    @InjectRepository(Plant)
    private plantsRepository: Repository<Plant>,
    private speciesService: SpeciesService,
    private locationsService: LocationsService,
  ) {}

  /**
   * Cria uma nova planta no sistema
   * @param createPlantDto Dados para criação da planta
   * @returns Planta criada
   */
  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    // Validações de negócio (mantidas do código histórico)
    const { name, purchaseDate, notes, photo } = createPlantDto as any;

    if (!name?.trim()) {
      throw new BadRequestException('O nome da planta é obrigatório.');
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) {
      throw new BadRequestException('O nome da planta não pode conter números ou caracteres especiais.');
    }

    if (!purchaseDate) {
      throw new BadRequestException('A data de compra é obrigatória.');
    }
    const parsedDate = parseYMDToLocalDate(purchaseDate);
    if (!parsedDate) {
      throw new BadRequestException('Data de compra inválida.');
    }
    const today = new Date();
    parsedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (parsedDate.getTime() > today.getTime()) {
      throw new BadRequestException('A data de compra não pode ser futura.');
    }

    if (!notes?.trim()) {
      throw new BadRequestException('O campo observações é obrigatório.');
    }
    if (notes && notes.length > 500) {
      throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
    }

    // Accept base64 data URIs or http(s) URLs for photos
    if (photo && typeof photo === 'string' && !(photo.startsWith('data:image/') || photo.startsWith('http'))) {
      throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
    }

    try {
      // Resolve speciesName -> speciesId
      const species = await this.speciesService.findByName(createPlantDto.speciesName);
      if (!species) {
        throw new BadRequestException(`Espécie '${createPlantDto.speciesName}' não encontrada`);
      }

      // Resolve locationName -> locationId
      const location = await this.locationsService.findByName(createPlantDto.locationName);
      if (!location) {
        throw new BadRequestException(`Localização '${createPlantDto.locationName}' não encontrada`);
      }

      const plant = this.plantsRepository.create({
        name: createPlantDto.name,
        speciesId: species.id,
        locationId: location.id,
        purchaseDate: parsedDate, // já convertido
        notes: createPlantDto.notes,
        photo: createPlantDto.photo,
      });

      const saved = await this.plantsRepository.save(plant);
      // Carrega relações para que o controller retorne species/location junto
      const withRelations = await this.plantsRepository.findOne({
        where: { id: saved.id },
        relations: ['species', 'location'],
      });
      return withRelations ?? saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao criar planta: ' + (error?.message || String(error)));
    }
  }

  /**
   * Retorna todas as plantas
   * @returns Lista de plantas
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
      where: { locationId },
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
      where: { speciesId },
      relations: ['species', 'location'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca planta por nome
   */
  async findByName(name: string): Promise<Plant | null> {
    if (!name) return null;
    const trimmed = name.trim();

    // 1) Exact case-insensitive match
    let found = await this.plantsRepository.findOne({ where: { name: ILike(trimmed) }, relations: ['species', 'location'] });
    if (found) return found;

    // 2) Partial match
    found = await this.plantsRepository.findOne({ where: { name: ILike(`%${trimmed}%`) }, relations: ['species', 'location'] });
    if (found) return found;

    // 3) Fallback normalized comparison
    const all = await this.plantsRepository.find({ relations: ['species', 'location'] });
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    const target = normalize(trimmed);
    return all.find((p) => normalize(p.name) === target) || null;
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

      // Valida apenas os campos enviados
      if (updatePlantDto.name !== undefined) {
        if (!updatePlantDto.name.trim()) {
          throw new BadRequestException('O nome da planta não pode ser vazio.');
        }
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(updatePlantDto.name)) {
          throw new BadRequestException('O nome da planta não pode conter números ou caracteres especiais.');
        }
      }

      // Se fornecer speciesName, resolve para speciesId
      if (updatePlantDto.speciesName) {
        const species = await this.speciesService.findByName(updatePlantDto.speciesName);
        if (!species) throw new BadRequestException(`Espécie '${updatePlantDto.speciesName}' não encontrada`);
        updateData.speciesId = species.id;
      }

      // Se fornecer locationName, resolve para locationId
      if (updatePlantDto.locationName) {
        const location = await this.locationsService.findByName(updatePlantDto.locationName);
        if (!location) throw new BadRequestException(`Localização '${updatePlantDto.locationName}' não encontrada`);
        updateData.locationId = location.id;
      }

      // Converte e valida purchaseDate se fornecido
      if (updatePlantDto.purchaseDate !== undefined) {
        if (!updatePlantDto.purchaseDate) {
          throw new BadRequestException('A data de compra não pode ser vazia.');
        }
        const pd = parseYMDToLocalDate(updatePlantDto.purchaseDate);
        if (!pd) throw new BadRequestException('Data de compra inválida.');
        const today = new Date();
        pd.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (pd.getTime() > today.getTime()) throw new BadRequestException('A data de compra não pode ser futura.');
        updateData.purchaseDate = pd;
      }

      // Valida observações se enviadas
      if (updatePlantDto.notes !== undefined) {
        if (!updatePlantDto.notes?.trim()) {
          throw new BadRequestException('O campo observações não pode ser vazio.');
        }
        if (updatePlantDto.notes.length > 500) {
          throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
        }
      }

      // Valida ou remove foto quando informado
      if (updatePlantDto.photo !== undefined) {
        if (updatePlantDto.photo === null || updatePlantDto.photo === '') {
          // remoção de foto
          updateData.photo = null;
        } else if (!(updatePlantDto.photo.startsWith('data:image/') || updatePlantDto.photo.startsWith('http'))) {
          throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
        }
      }

      const updated = this.plantsRepository.merge(plant, updateData);
      const saved = await this.plantsRepository.save(updated);
      const withRelations = await this.plantsRepository.findOne({
        where: { id: saved.id },
        relations: ['species', 'location'],
      });
      return withRelations ?? saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao atualizar planta: ' + (error?.message || String(error)));
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
   * Remove todas as plantas e dados dependentes (lembretes e logs) em uma transação.
   * Usado para operações de limpeza completa pelo usuário.
   */
  async removeAll(): Promise<void> {
    // Usa transação para garantir consistência e evitar erros de FK
    await this.plantsRepository.manager.transaction(async (manager) => {
      const remindersRepo = manager.getRepository(CareReminder);
      const logsRepo = manager.getRepository(CareLog);
      const plantsRepo = manager.getRepository(Plant);

      // Primeiro removemos todos os lembretes e logs relacionados
      await remindersRepo.createQueryBuilder().delete().execute();
      await logsRepo.createQueryBuilder().delete().execute();

      // Em seguida removemos as plantas
      await plantsRepo.createQueryBuilder().delete().execute();
    });
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