import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      // Verifica se já existe uma espécie com o mesmo nome científico
      const existingSpecies = await this.speciesRepository.findOne({
        where: { scientificName: createSpeciesDto.scientificName }
      });

      if (existingSpecies) {
        throw new BadRequestException('Já existe uma espécie com este nome científico');
      }

      const species = this.speciesRepository.create(createSpeciesDto);
      return await this.speciesRepository.save(species);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar espécie: ' + error.message);
    }
  }

  /**
   * Retorna todas as espécies com suas relações
   * @returns Lista de espécies com plantas associadas
   */
  async findAll(): Promise<Species[]> {
    return await this.speciesRepository.find({
      relations: ['plants'],
      order: { name: 'ASC' }, // Ordena por nome alfabeticamente
    });
  }

  /**
   * Busca espécies por requisitos de luz
   * @param lightRequirements Requisitos de luz (low, medium, high)
   * @returns Espécies com os requisitos especificados
   */
  async findByLightRequirements(lightRequirements: string): Promise<Species[]> {
    return await this.speciesRepository.find({
      where: { lightRequirements },
      relations: ['plants'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca espécies por frequência de rega
   * @param waterFrequency Frequência de rega (daily, weekly, biweekly, monthly)
   * @returns Espécies com a frequência especificada
   */
  async findByWaterFrequency(waterFrequency: string): Promise<Species[]> {
    return await this.speciesRepository.find({
      where: { waterFrequency },
      relations: ['plants'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca uma espécie específica pelo ID
   * @param id UUID da espécie
   * @returns Espécie encontrada com plantas associadas
   * @throws NotFoundException se a espécie não existir
   */
  async findOne(id: string): Promise<Species> {
    const species = await this.speciesRepository.findOne({
      where: { id },
      relations: ['plants'],
    });

    if (!species) {
      throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
    }

    return species;
  }

  /**
   * Busca uma espécie pelo nome científico
   * @param scientificName Nome científico da espécie
   * @returns Espécie encontrada
   */
  async findByScientificName(scientificName: string): Promise<Species | null> {
    return await this.speciesRepository.findOne({
      where: { scientificName },
      relations: ['plants'],
    });
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
      // Se estiver atualizando o nome científico, verifica duplicata
      if (updateSpeciesDto.scientificName && updateSpeciesDto.scientificName !== species.scientificName) {
        const existingSpecies = await this.findByScientificName(updateSpeciesDto.scientificName);
        if (existingSpecies) {
          throw new BadRequestException('Já existe uma espécie com este nome científico');
        }
      }

      const updated = this.speciesRepository.merge(species, updateSpeciesDto);
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
    if (species.plants && species.plants.length > 0) {
      throw new BadRequestException(
        `Não é possível remover a espécie '${species.name}' pois existem ${species.plants.length} plantas associadas a ela.`
      );
    }

    const result = await this.speciesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
    }
  }

  /**
   * Estatísticas de espécies por requisitos de luz
   * @returns Contagem de espécies por requisitos de luz
   */
  async getLightRequirementsStats(): Promise<{ lightRequirements: string; count: number }[]> {
    return await this.speciesRepository
      .createQueryBuilder('species')
      .select('species.lightRequirements', 'lightRequirements')
      .addSelect('COUNT(species.id)', 'count')
      .groupBy('species.lightRequirements')
      .getRawMany();
  }

  /**
   * Estatísticas de espécies por frequência de rega
   * @returns Contagem de espécies por frequência de rega
   */
  async getWaterFrequencyStats(): Promise<{ waterFrequency: string; count: number }[]> {
    return await this.speciesRepository
      .createQueryBuilder('species')
      .select('species.waterFrequency', 'waterFrequency')
      .addSelect('COUNT(species.id)', 'count')
      .groupBy('species.waterFrequency')
      .getRawMany();
  }

  /**
   * Busca espécies que são fáceis de cuidar (baixa frequência de rega e luz média/baixa)
   * @returns Espécies consideradas fáceis de cuidar
   */
  async findEasyCareSpecies(): Promise<Species[]> {
    return await this.speciesRepository.find({
      where: [
        { 
          waterFrequency: 'weekly', 
          lightRequirements: 'low' 
        },
        { 
          waterFrequency: 'biweekly', 
          lightRequirements: 'low' 
        },
        { 
          waterFrequency: 'biweekly', 
          lightRequirements: 'medium' 
        }
      ],
      relations: ['plants'],
      order: { waterFrequency: 'ASC', name: 'ASC' },
    });
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
    const species = await this.findOne(id);
    return {
      canBeRemoved: !species.plants || species.plants.length === 0,
      plantCount: species.plants ? species.plants.length : 0
    };
  }
}