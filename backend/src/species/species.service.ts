import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Species } from './entities/species.entity';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import * as path from 'path';

@Injectable()
export class SpeciesService implements OnModuleInit {
  constructor(
    @InjectRepository(Species)
    private speciesRepository: Repository<Species>,
  ) { }

  async onModuleInit() {
    await this.seedDefaultSpecies();
  }

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
          },
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

  async create(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    try {
      // 🔹 Regras 1 e 2 — nomes obrigatórios e sem números
      if (!createSpeciesDto.name?.trim()) {
        throw new BadRequestException('O nome científico é obrigatório.');
      }
      if (!createSpeciesDto.commonName?.trim()) {
        throw new BadRequestException('O nome comum é obrigatório.');
      }
      if (/\d/.test(createSpeciesDto.name)) {
        throw new BadRequestException('O nome científico não pode conter números.');
      }
      if (/\d/.test(createSpeciesDto.commonName)) {
        throw new BadRequestException('O nome comum não pode conter números.');
      }

      // 🔹 Regras 3–5 — campos obrigatórios e limite de 500 caracteres
      if (!createSpeciesDto.description?.trim()) {
        throw new BadRequestException('A descrição é obrigatória.');
      }
      if (createSpeciesDto.description.length > 500) {
        throw new BadRequestException('A descrição deve ter no máximo 500 caracteres.');
      }

      if (!createSpeciesDto.careInstructions?.trim()) {
        throw new BadRequestException('As instruções de cuidado são obrigatórias.');
      }
      if (createSpeciesDto.careInstructions.length > 500) {
        throw new BadRequestException('As instruções de cuidado devem ter no máximo 500 caracteres.');
      }

      if (!createSpeciesDto.idealConditions?.trim()) {
        throw new BadRequestException('As condições ideais são obrigatórias.');
      }
      if (createSpeciesDto.idealConditions.length > 500) {
        throw new BadRequestException('As condições ideais devem ter no máximo 500 caracteres.');
      }

      // 🔹 Regra 6 — imagem opcional, mas precisa ser arquivo de imagem válido
      if (createSpeciesDto.photo) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const isValid = validExtensions.some(ext =>
          createSpeciesDto.photo!.toLowerCase().endsWith(ext),
        );
        // 🔹 Regra 6 — imagem opcional, mas precisa ser base64 válida
        if (createSpeciesDto.photo && !createSpeciesDto.photo.startsWith('data:image/')) {
          throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido (formato base64).');
        }


      }

      const existingSpecies = await this.speciesRepository.findOne({ where: { name: createSpeciesDto.name } });
      if (existingSpecies) {
        throw new BadRequestException('Já existe uma espécie com este nome.');
      }

      const species = this.speciesRepository.create(createSpeciesDto);
      return await this.speciesRepository.save(species);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao criar espécie: ' + error.message);
    }
  }

  async findAll(): Promise<Species[]> {
    return await this.speciesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Species> {
    const species = await this.speciesRepository.findOne({ where: { id } });
    if (!species) throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
    return species;
  }

  async findByName(name: string): Promise<Species | null> {
    return await this.speciesRepository.findOne({ where: { name } });
  }

  async update(id: string, updateSpeciesDto: UpdateSpeciesDto): Promise<Species> {
    const species = await this.findOne(id);
    try {
      if (updateSpeciesDto.name && updateSpeciesDto.name !== species.name) {
        const existingSpecies = await this.findByName(updateSpeciesDto.name);
        if (existingSpecies) {
          throw new BadRequestException('Já existe uma espécie com este nome.');
        }
      }

      // 🔹 Validação de imagem (Regra 6)
if (updateSpeciesDto.photo !== undefined) {
  if (updateSpeciesDto.photo === null || updateSpeciesDto.photo === '') {
    // Usuário removeu a imagem
    species.photo = null;
  } else if (!updateSpeciesDto.photo.startsWith('data:image/')) {
    throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido (formato base64).');
  } else {
    // Usuário enviou uma nova imagem
    species.photo = updateSpeciesDto.photo;
  }
}


      const updated = this.speciesRepository.merge(species, updateSpeciesDto);
      return await this.speciesRepository.save(updated);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erro ao atualizar espécie: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    const species = await this.findOne(id);

    const plantsCount = await this.speciesRepository
      .createQueryBuilder('species')
      .leftJoin('species.plants', 'plant')
      .where('species.id = :id', { id })
      .select('COUNT(plant.id)', 'count')
      .getRawOne();

    if (parseInt(plantsCount.count) > 0) {
      throw new BadRequestException(
        `Não é possível remover a espécie '${species.name}' pois existem ${plantsCount.count} plantas associadas.`
      );
    }

    const result = await this.speciesRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Espécie com ID ${id} não encontrada`);
  }

  async getTotalCount(): Promise<number> {
    return await this.speciesRepository.count();
  }

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
    return { canBeRemoved: plantCount === 0, plantCount };
  }
}
