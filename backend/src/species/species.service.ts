import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Species } from './entities/species.entity';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

@Injectable()
export class SpeciesService implements OnModuleInit {
  constructor(
    @InjectRepository(Species)
    private speciesRepository: Repository<Species>,
  ) {}

  /**
   * Executado automaticamente quando o módulo é inicializado
   */
  async onModuleInit() {
    await this.seedDefaultSpecies();
  }

  /**
   * Cria espécies padrão se não existirem
   */
  private async seedDefaultSpecies(): Promise<void> {
    try {
      const existingCount = await this.speciesRepository.count();
      
      if (existingCount === 0) {
        console.log('🌱 Creating default species...');
        
        const defaultSpecies = [
          {
            name: 'Monstera deliciosa',
            commonName: 'Costela de Adão',
            description: 'Planta tropical com folhas grandes e recortadas.',
            careInstructions: 'Luz indireta, rega moderada.',
            idealConditions: 'Sol parcial, umidade média.',
            photo: 'https://example.com/monstera.jpg',
          },
          {
            name: 'Ficus lyrata',
            commonName: 'Figueira-lira',
            description: 'Planta com folhas grandes em forma de lira.',
            careInstructions: 'Luz brilhante, rega quando o solo estiver seco.',
            idealConditions: 'Sol pleno, umidade alta.',
            photo: 'https://example.com/ficus-lyrata.jpg',
          },
          {
            name: 'Sansevieria trifasciata',
            commonName: 'Espada-de-são-jorge',
            description: 'Planta resistente com folhas eretas e pontiagudas.',
            careInstructions: 'Luz indireta, pouca rega.',
            idealConditions: 'Sol ou sombra, tolerante à seca.',
            photo: 'https://example.com/sansevieria.jpg',
          },
          {
            name: 'Epipremnum aureum',
            commonName: 'Jiboia',
            description: 'Planta trepadeira de fácil cultivo e crescimento rápido.',
            careInstructions: 'Luz indireta, rega moderada.',
            idealConditions: 'Meia-sombra, solo bem drenado.',
            photo: 'https://example.com/jiboia.jpg',
          },
          {
            name: 'Zamioculcas zamiifolia',
            commonName: 'Zamioculca',
            description: 'Planta muito resistente com folhas brilhantes e carnudas.',
            careInstructions: 'Luz indireta, pouca rega.',
            idealConditions: 'Sombra a meia-sombra, solo seco.',
            photo: 'https://example.com/zamioculca.jpg',
          }
        ];

        const speciesToCreate = this.speciesRepository.create(defaultSpecies);
        await this.speciesRepository.save(speciesToCreate);
        
        console.log(`✅ Created ${speciesToCreate.length} default species`);
      } else {
        console.log(`✅ Species already exist in database (${existingCount} records)`);
      }
    } catch (error) {
      console.error('❌ Error creating default species:', error);
    }
  }

  /**
   * Cria uma nova espécie no sistema
   * @param createSpeciesDto Dados para criação da espécie
   * @returns Espécie criada
   */
  async create(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    try {
      // Verifica se já existe uma espécie com o mesmo nome
      const existingSpecies = await this.speciesRepository.findOne({
        where: { name: createSpeciesDto.name }
      });

      if (existingSpecies) {
        throw new BadRequestException('Já existe uma espécie com este nome');
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
    return await this.speciesRepository.findOne({
      where: { name },
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
      // Se estiver atualizando o nome, verifica duplicata
      if (updateSpeciesDto.name && updateSpeciesDto.name !== species.name) {
        const existingSpecies = await this.findByName(updateSpeciesDto.name);
        if (existingSpecies) {
          throw new BadRequestException('Já existe uma espécie com este nome');
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