import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Species } from './entities/species.entity';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(Species)
    private speciesRepository: Repository<Species>,
  ) {}

 

  /**
   * Cria uma nova espécie no sistema
   * @param createSpeciesDto Dados para criação da espécie
   * @returns Espécie criada
   */
  async create(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    try {
  const { name, commonName, description, careInstructions, idealConditions, photo } = createSpeciesDto as any;

      if (!name?.trim()) {
        throw new BadRequestException('O nome científico da espécie é obrigatório.');
      }
      if (!commonName?.trim()) {
        throw new BadRequestException('O nome comum da espécie é obrigatório.');
      }

      // Nome: não permitir números
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name) || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(commonName)) {
        throw new BadRequestException('Os nomes não podem conter números ou caracteres especiais.');
      }

      // Verifica se já existe uma espécie com o mesmo nome ou nome comum (verificação estrita, case-insensitive)
      const trimmed = name.trim();
      const trimmedCommon = commonName.trim();
      const existingExact = await this.speciesRepository.findOne({
        where: [
          { name: ILike(trimmed) },
          { commonName: ILike(trimmed) },
          { name: ILike(trimmedCommon) },
          { commonName: ILike(trimmedCommon) },
        ],
      });
      if (existingExact) {
        throw new BadRequestException('Já existe uma espécie com este nome ou nome comum.');
      }

      if (!description?.trim()) {
        throw new BadRequestException('A descrição da espécie é obrigatória.');
      }
      if (!careInstructions?.trim()) {
        throw new BadRequestException('As instruções de cuidado são obrigatórias.');
      }
      if (!idealConditions?.trim()) {
        throw new BadRequestException('As condições ideais são obrigatórias.');
      }

      if (description && description.length > 500) {
        throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');
      }
      if (careInstructions && careInstructions.length > 500) {
        throw new BadRequestException('As instruções de cuidado devem ter no máximo 500 caracteres.');
      }
      if (idealConditions && idealConditions.length > 500) {
        throw new BadRequestException('As condições ideais devem ter no máximo 500 caracteres.');
      }

      // Allow base64 data URIs or http(s) URLs; ignore empty string
      if (photo && typeof photo === 'string' && !(photo.startsWith('data:image/') || photo.startsWith('http'))) {
        throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
      }

      const species = this.speciesRepository.create(createSpeciesDto);
      return await this.speciesRepository.save(species);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar espécie: ' + (error?.message || String(error)));
    }
  }

  /**
   * Retorna todas as espécies
   * @returns Lista de espécies
   */
  async findAll(): Promise<Species[]> {
    return await this.speciesRepository.find({
      order: { name: 'ASC' }, // Ordena por nome alfabeticamente
    });
  }

  /**
   * Busca uma espécie específica pelo ID
   * @param id UUID da espécie
   * @returns Espécie encontrada
   * @throws NotFoundException se a espécie não existir
   */
  async findOne(id: string): Promise<Species> {
    const species = await this.speciesRepository.findOne({
      where: { id },
    });

    if (!species) {
      throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
    }

    return species;
  }

  /**
   * Busca uma espécie pelo nome
   * @param name Nome da espécie
   * @returns Espécie encontrada
   */
  async findByName(name: string): Promise<Species | null> {
    if (!name) return null;
    const trimmed = name.trim();

    // 1) Try matching scientific name (case-insensitive)
    let found = await this.speciesRepository.findOne({ where: { name: ILike(trimmed) } });
    if (found) return found;

    // 2) Try matching commonName
    found = await this.speciesRepository.findOne({ where: { commonName: ILike(trimmed) } });
    if (found) return found;

    // 3) Partial matches
    found = await this.speciesRepository.findOne({ where: { name: ILike(`%${trimmed}%`) } });
    if (found) return found;
    found = await this.speciesRepository.findOne({ where: { commonName: ILike(`%${trimmed}%`) } });
    if (found) return found;

    // 4) Fallback normalized comparison
    const all = await this.speciesRepository.find();
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    const target = normalize(trimmed);
    return all.find((sp) => normalize(sp.name) === target || (sp.commonName && normalize(sp.commonName) === target)) || null;
  }

  /**
   * Atualiza os dados de uma espécie existente
   * @param id UUID da espécie a ser atualizada
   * @param updateSpeciesDto Dados parciais para atualização
   * @returns Espécie atualizada
   */
  async update(id: string, updateSpeciesDto: UpdateSpeciesDto): Promise<Species> {
    const species = await this.findOne(id); // Valida se a espécie existe
    
    try {
      // Se estiver atualizando o nome, verifica duplicata
      if (updateSpeciesDto.name && updateSpeciesDto.name !== species.name) {
        const trimmedNew = updateSpeciesDto.name.trim();
        const existingSpecies = await this.speciesRepository.findOne({
          where: [{ name: ILike(trimmedNew) }, { commonName: ILike(trimmedNew) }],
        });
        if (existingSpecies && existingSpecies.id !== species.id) {
          throw new BadRequestException('Já existe uma espécie com este nome');
        }
      }

      const updateData: any = { ...updateSpeciesDto };
      // Validações adicionais
      if (updateData.name !== undefined) {
        if (!updateData.name?.trim()) {
          throw new BadRequestException('O nome científico da espécie não pode ser vazio.');
        }
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(updateData.name)) {
          throw new BadRequestException('O nome científico não pode conter números ou caracteres especiais.');
        }
      }

      if (updateData.description !== undefined) {
        if (!updateData.description?.trim()) {
          throw new BadRequestException('A descrição não pode ser vazia.');
        }
        if (updateData.description.length > 500) {
          throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');
        }
      }

      if (updateData.careInstructions !== undefined) {
        if (!updateData.careInstructions?.trim()) {
          throw new BadRequestException('As instruções de cuidado não podem ser vazias.');
        }
        if (updateData.careInstructions.length > 500) {
          throw new BadRequestException('As instruções de cuidado devem ter no máximo 500 caracteres.');
        }
      }

      if (updateData.idealConditions !== undefined) {
        if (!updateData.idealConditions?.trim()) {
          throw new BadRequestException('As condições ideais não podem ser vazias.');
        }
        if (updateData.idealConditions.length > 500) {
          throw new BadRequestException('As condições ideais devem ter no máximo 500 caracteres.');
        }
      }

      if (updateData.photo !== undefined) {
        if (updateData.photo === null || updateData.photo === '') {
          updateData.photo = null;
        } else if (typeof updateData.photo === 'string' && !(updateData.photo.startsWith('data:image/') || updateData.photo.startsWith('http'))) {
          throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
        }
      }

      const updated = this.speciesRepository.merge(species, updateData);
      return await this.speciesRepository.save(updated);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar espécie: ' + error.message);
    }
  }

  /**
   * Remove uma espécie do sistema
   * @param id UUID da espécie a ser removida
   * @throws NotFoundException se a espécie não existir
   */
  async remove(id: string): Promise<void> {
    const species = await this.findOne(id);
    
    // Verifica se a espécie tem plantas associadas
    const plantsCount = await this.speciesRepository
      .createQueryBuilder('species')
      .leftJoin('species.plants', 'plant')
      .where('species.id = :id', { id })
      .select('COUNT(plant.id)', 'count')
      .getRawOne();

    if (parseInt(plantsCount.count) > 0) {
      throw new BadRequestException(
        `Não é possível remover a espécie '${species.name}' pois existem ${plantsCount.count} plantas associadas a ela.`
      );
    }

    const result = await this.speciesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
    }
  }

  /**
   * Contagem total de espécies no sistema
   * @returns Número total de espécies
   */
  async getTotalCount(): Promise<number> {
    return await this.speciesRepository.count();
  }

  /**
   * Verifica se uma espécie pode ser removida (não tem plantas associadas)
   * @param id UUID da espécie
   * @returns true se a espécie pode ser removida
   */
  async canBeRemoved(id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> {
    const species = await this.speciesRepository
      .createQueryBuilder('species')
      .leftJoin('species.plants', 'plant')
      .where('species.id = :id', { id })
      .select(['species.id', 'COUNT(plant.id) as plantCount'])
      .groupBy('species.id')
      .getRawOne();

    if (!species) {
      throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
    }

    const plantCount = parseInt(species.plantCount) || 0;
    
    return {
      canBeRemoved: plantCount === 0,
      plantCount
    };
  }
}