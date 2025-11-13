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
  ) { }

  /**
   * Cria uma nova planta no sistema
   */
  async create(createPlantDto: CreatePlantDto): Promise<Plant> {
    const { name, speciesId, locationId, purchaseDate, notes, photo } = createPlantDto;

    // 🧠 Regra 1: Nome obrigatório e sem caracteres especiais
    if (!name?.trim()) {
      throw new BadRequestException('O nome da planta é obrigatório.');
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) {
      throw new BadRequestException('O nome da planta não pode conter números ou caracteres especiais.');
    }

    // 🧠 Regra 2: Espécie obrigatória
    if (!speciesId) {
      throw new BadRequestException('A espécie é obrigatória.');
    }

    // 🧠 Regra 3: Local obrigatório
    if (!locationId) {
      throw new BadRequestException('O local é obrigatório.');
    }

    // 🧠 Regra 4: Data de compra obrigatória e não pode ser futura
    if (!purchaseDate) {
      throw new BadRequestException('A data de compra é obrigatória.');
    }
    const date = new Date(purchaseDate);
    const today = new Date();

    // Zera o horário de ambos (garante comparação por dia)
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Data de compra inválida.');
    }

    // ✅ Agora permite hoje e passado
    if (date.getTime() > today.getTime()) {
      throw new BadRequestException('A data de compra não pode ser futura.');
    }

    // 🧠 Regra 5: Observações obrigatórias e limite de 500 caracteres
    if (!notes?.trim()) {
      throw new BadRequestException('O campo observações é obrigatório.');
    }
    if (notes.length > 500) {
      throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
    }

    // 🧠 Regra 6: Imagem opcional, mas deve ser base64 válida
    if (photo && !photo.startsWith('data:image/')) {
      throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
    }


    try {
      const plant = this.plantsRepository.create({
        ...createPlantDto,
        purchaseDate: date,
      });
      return await this.plantsRepository.save(plant);
    } catch (error) {
      throw new BadRequestException('Erro ao criar planta: ' + error.message);
    }
  }

  /**
   * Atualiza os dados de uma planta existente
   */
  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    const plant = await this.findOne(id);

    const { name, speciesId, locationId, purchaseDate, notes, photo } = updatePlantDto;

    // 🧠 Valida apenas os campos enviados

    // Regra 1: Nome (se enviado)
    if (name !== undefined) {
      if (!name.trim()) {
        throw new BadRequestException('O nome da planta não pode ser vazio.');
      }
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) {
        throw new BadRequestException('O nome da planta não pode conter números ou caracteres especiais.');
      }
    }

    // Regra 2: Espécie (se enviada)
    if (speciesId !== undefined && !speciesId) {
      throw new BadRequestException('A espécie é obrigatória.');
    }

    // Regra 3: Local (se enviado)
    if (locationId !== undefined && !locationId) {
      throw new BadRequestException('O local é obrigatório.');
    }

    // Regra 4: Data de compra (se enviada)
    if (purchaseDate !== undefined) {
      const date = new Date(purchaseDate);
      const today = new Date();

      // Zera o horário de ambos (garante comparação por dia)
      date.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (isNaN(date.getTime())) {
        throw new BadRequestException('Data de compra inválida.');
      }

      // ✅ Agora permite hoje e passado
      if (date.getTime() > today.getTime()) {
        throw new BadRequestException('A data de compra não pode ser futura.');
      }

      // 👇 Adicione esta linha:
      plant.purchaseDate = date;
    }

    // Regra 5: Observações (se enviada)
    if (notes !== undefined) {
      if (!notes.trim()) {
        throw new BadRequestException('O campo observações não pode ser vazio.');
      }
      if (notes.length > 500) {
        throw new BadRequestException('O campo observações deve ter no máximo 500 caracteres.');
      }
      plant.notes = notes;
    }

    // Regra 6: Imagem (se enviada)
if (photo !== undefined) {
  if (photo === null || photo === '') {
    // 🔹 Usuário removeu a imagem
    plant.photo = null;
  } else if (!photo.startsWith('data:image/')) {
    throw new BadRequestException('A imagem enviada deve ser um arquivo de imagem válido');
  } else {
    // 🔹 Usuário enviou nova imagem válida
    plant.photo = photo;
  }
}


    try {
      const updated = this.plantsRepository.merge(plant, updatePlantDto);
      return await this.plantsRepository.save(updated);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar planta: ' + error.message);
    }
  }

  // 🔹 Demais métodos (findAll, findOne, remove etc.) permanecem inalterados

  async findAll(): Promise<Plant[]> {
    return await this.plantsRepository.find({ order: { name: 'ASC' } });
  }

  async findByLocation(locationId: string): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: { locationId },
      order: { name: 'ASC' },
    });
  }

  async findBySpecies(speciesId: string): Promise<Plant[]> {
    return await this.plantsRepository.find({
      where: { speciesId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantsRepository.findOne({ where: { id } });
    if (!plant) {
      throw new NotFoundException(`Planta com ID ${id} não encontrada`);
    }
    return plant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.plantsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Planta com ID ${id} não encontrada`);
    }
  }

  async getLocationStats(): Promise<{ locationId: string; count: number }[]> {
    return await this.plantsRepository
      .createQueryBuilder('plant')
      .select('plant.locationId', 'locationId')
      .addSelect('COUNT(plant.id)', 'count')
      .groupBy('plant.locationId')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async getTotalCount(): Promise<number> {
    return await this.plantsRepository.count();
  }
}
