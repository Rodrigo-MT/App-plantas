import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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
      const { name, type, sunlight, humidity, description, photo } = createLocationDto as any;

      if (!name?.trim()) {
        throw new BadRequestException('O nome da localização é obrigatório.');
      }
      // Nome: permitir letras, números, espaços e acentos
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/.test(name)) {
        throw new BadRequestException('O nome da localização contém caracteres inválidos.');
      }

      // Verifica duplicata por nome (case-insensitive, apenas correspondência exata)
      const existing = await this.findByNameExact(name);
      if (existing) {
        throw new BadRequestException(`Já existe uma localização com o nome '${name}'.`);
      }

      if (!description?.trim()) {
        throw new BadRequestException('A descrição da localização é obrigatória.');
      }
      if (description && description.length > 500) {
        throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');
      }

      // Allow either data:image/* base64 strings or http(s) URLs. Treat empty as absent.
      if (photo && typeof photo === 'string' && !photo.trim().length) {
        // empty string -> treat as not provided
      } else if (photo && typeof photo === 'string' && !photo.startsWith('data:image/') && !photo.startsWith('http')) {
        throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
      }

      const location = this.locationsRepository.create(createLocationDto);
      return await this.locationsRepository.save(location);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao criar localização: ' + (error?.message || String(error)));
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
      const updateData: any = { ...updateLocationDto };

      if (updateLocationDto.name !== undefined) {
        if (!updateLocationDto.name?.trim()) {
          throw new BadRequestException('O nome da localização não pode ser vazio.');
        }
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(updateLocationDto.name)) {
          throw new BadRequestException('O nome da localização não pode conter números ou caracteres especiais.');
        }
        // verifica duplicata exata (exceto a atual)
        const existing = await this.findByNameExact(updateLocationDto.name);
        if (existing && existing.id !== id) {
          throw new BadRequestException(`Já existe uma localização com o nome '${updateLocationDto.name}'.`);
        }
      }

      if (updateLocationDto.description !== undefined) {
        if (!updateLocationDto.description?.trim()) {
          throw new BadRequestException('A descrição não pode ser vazia.');
        }
        if (updateLocationDto.description.length > 500) {
          throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');
        }
      }

      if (updateLocationDto.photo !== undefined) {
        if (updateLocationDto.photo === null || updateLocationDto.photo === '') {
          updateData.photo = null;
        } else if (typeof updateLocationDto.photo === 'string' && !(updateLocationDto.photo.startsWith('data:image/') || updateLocationDto.photo.startsWith('http')) ) {
          throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
        }
      }

      const updated = this.locationsRepository.merge(location, updateData);
      return await this.locationsRepository.save(updated);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao atualizar localização: ' + (error?.message || String(error)));
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
    try {
      // Use a raw query builder and normalize the plantCount to a number
      const raws = await this.locationsRepository
        .createQueryBuilder('location')
        .leftJoin('location.plants', 'plant')
        .select('location.id', 'locationId')
        .addSelect('location.name', 'locationName')
        // Cast count to integer in Postgres to avoid string results, but normalize just in case
        .addSelect('COUNT(plant.id)', 'plantCount')
        .groupBy('location.id')
        .addGroupBy('location.name')
  // Order by the COUNT expression directly to avoid Postgres alias resolution issues
  .orderBy('COUNT(plant.id)', 'DESC')
        .getRawMany();

      // Normalize plantCount to number (TypeORM may return string for COUNT)
      return raws.map((r: any) => ({
        locationId: r.locationId,
        locationName: r.locationName,
        plantCount: typeof r.plantCount === 'string' ? parseInt(r.plantCount, 10) || 0 : Number(r.plantCount) || 0,
      }));
    } catch (error) {
      // Throw a Nest-friendly 500 with context (will be returned as Internal Server Error to the client)
      throw new InternalServerErrorException('Erro ao calcular estatísticas de localizações: ' + (error?.message || String(error)));
    }
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

  /**
   * Busca localização por nome
   * @param name Nome da localização
   */
  async findByName(name: string): Promise<Location | null> {
    if (!name) return null;
    const trimmed = name.trim();

    // 1) Exact case-insensitive match
    let found = await this.locationsRepository.findOne({ where: { name: ILike(trimmed) } });
    if (found) return found;

    // 2) Partial match
    found = await this.locationsRepository.findOne({ where: { name: ILike(`%${trimmed}%`) } });
    if (found) return found;

    // 3) Fallback: load all and compare normalized strings (strip diacritics, lowercase, trim)
    const all = await this.locationsRepository.find();
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    const target = normalize(trimmed);
    return all.find((l) => normalize(l.name) === target) || null;
  }

  /**
   * Busca localização por nome (apenas correspondência exata case-insensitive)
   * usada para validação de duplicidade em criação/atualização
   */
  async findByNameExact(name: string): Promise<Location | null> {
    if (!name) return null;
    return await this.locationsRepository.findOne({ where: { name: ILike(name.trim()) } });
  }
}