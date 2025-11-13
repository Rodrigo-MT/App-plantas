import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareReminder } from './entities/care-reminder.entity';
import { CreateCareReminderDto } from './dto/create-care-reminder.dto';
import { UpdateCareReminderDto } from './dto/update-care-reminder.dto';
import { PlantsService } from '../plants/plants.service';

@Injectable()
export class CareRemindersService {
  constructor(
    @InjectRepository(CareReminder)
    private careRemindersRepository: Repository<CareReminder>,

    private readonly plantsService: PlantsService, // 🔹 usada p/ validar planta existente
  ) {}

  /**
   * Cria um novo lembrete de cuidado
   */
  async create(
    createCareReminderDto: CreateCareReminderDto,
  ): Promise<CareReminder> {
    const { plantId, type, frequency, lastDone, nextDue } = createCareReminderDto;

    // 🔸 Verifica se a planta existe
    const plant = await this.plantsService.findOne(plantId);
    if (!plant) {
      throw new NotFoundException(`A planta associada (ID: ${plantId}) não foi encontrada.`);
    }

    // 🔸 Valida datas
    const lastDoneDate = new Date(lastDone);
    const nextDueDate = new Date(nextDue);

    if (isNaN(lastDoneDate.getTime()) || isNaN(nextDueDate.getTime())) {
      throw new BadRequestException('As datas fornecidas são inválidas ou estão em formato incorreto.');
    }

    // 🔹 Zera horas para comparar apenas a data
    lastDoneDate.setHours(0, 0, 0, 0);
    nextDueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔹 lastDone não pode ser no futuro
    if (lastDoneDate.getTime() > today.getTime()) {
      throw new BadRequestException('A data da última realização deve ser hoje ou anterior.');
    }

    // 🔹 nextDue deve ser após lastDone
    if (nextDueDate.getTime() <= lastDoneDate.getTime()) {
      throw new BadRequestException('A data de "nextDue" deve ser posterior à data de "lastDone".');
    }

    // 🔸 Valida frequência
    if (frequency <= 0) {
      throw new BadRequestException('A frequência deve ser um número positivo (em dias).');
    }

    try {
      const reminder = this.careRemindersRepository.create({
        type,
        frequency,
        lastDone: lastDoneDate,
        nextDue: nextDueDate,
        plant,
        isActive: true,
      });

      return await this.careRemindersRepository.save(reminder);
    } catch (error) {
      throw new BadRequestException('Erro ao criar lembrete: ' + error.message);
    }
  }

  async findOne(id: string): Promise<CareReminder> {
    const reminder = await this.careRemindersRepository.findOne({
      where: { id },
      relations: ['plant'],
    });
    if (!reminder) {
      throw new NotFoundException(`Lembrete com ID ${id} não encontrado.`);
    }
    return reminder;
  }

  async update(
    id: string,
    updateCareReminderDto: UpdateCareReminderDto,
  ): Promise<CareReminder> {
    const reminder = await this.findOne(id);
    const { plantId, lastDone, nextDue, frequency } = updateCareReminderDto;

    // 🔸 Atualiza planta se fornecida
    if (plantId) {
      const plant = await this.plantsService.findOne(plantId);
      if (!plant) {
        throw new NotFoundException(`A planta associada (ID: ${plantId}) não foi encontrada.`);
      }
      reminder.plant = plant;
    }

    // 🔸 Valida datas se fornecidas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastDone) {
      const lastDoneDate = new Date(lastDone);
      if (isNaN(lastDoneDate.getTime())) {
        throw new BadRequestException('Data "lastDone" inválida.');
      }
      lastDoneDate.setHours(0, 0, 0, 0);
      if (lastDoneDate.getTime() > today.getTime()) {
        throw new BadRequestException('A data da última realização deve ser hoje ou anterior.');
      }
      reminder.lastDone = lastDoneDate;
    }

    if (nextDue) {
      const nextDueDate = new Date(nextDue);
      if (isNaN(nextDueDate.getTime())) {
        throw new BadRequestException('Data "nextDue" inválida.');
      }
      nextDueDate.setHours(0, 0, 0, 0);
      reminder.nextDue = nextDueDate;
    }

    // 🔹 Valida coerência entre datas
    if (reminder.lastDone && reminder.nextDue) {
      if (reminder.nextDue.getTime() <= reminder.lastDone.getTime()) {
        throw new BadRequestException('A data "nextDue" deve ser posterior à "lastDone".');
      }
    }

    // 🔸 Valida frequência
    if (frequency !== undefined && frequency <= 0) {
      throw new BadRequestException('A frequência deve ser um número positivo (em dias).');
    }

    Object.assign(reminder, updateCareReminderDto);

    try {
      return await this.careRemindersRepository.save(reminder);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar lembrete: ' + error.message);
    }
  }

  /**
   * Remove lembrete
   */
  async remove(id: string): Promise<void> {
    const result = await this.careRemindersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lembrete com ID ${id} não encontrado.`);
    }
  }

  /**
   * Lembretes atrasados
   */
  async findOverdue(): Promise<CareReminder[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.nextDue < :today', { today })
      .andWhere('reminder.isActive = :isActive', { isActive: true })
      .orderBy('reminder.nextDue', 'ASC')
      .getMany();
  }

  /**
   * Lembretes próximos (até 3 dias)
   */
  async findUpcoming(): Promise<CareReminder[]> {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    return await this.careRemindersRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.plant', 'plant')
      .where('reminder.nextDue BETWEEN :today AND :future', {
        today,
        future: threeDaysFromNow,
      })
      .andWhere('reminder.isActive = :isActive', { isActive: true })
      .orderBy('reminder.nextDue', 'ASC')
      .getMany();
  }

  /**
   * Marca como concluído
   */
  async markAsDone(id: string): Promise<CareReminder> {
    const reminder = await this.findOne(id);

    const today = new Date();
    const nextDue = new Date(today);
    nextDue.setDate(today.getDate() + reminder.frequency);

    reminder.lastDone = today;
    reminder.nextDue = nextDue;

    return await this.careRemindersRepository.save(reminder);
  }

  /**
   * Busca lembretes ativos
   */
  async findActive(): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      where: { isActive: true },
      relations: ['plant'],
      order: { nextDue: 'ASC' },
    });
  }

  /**
   * Contagem total
   */
  async getTotalCount(): Promise<number> {
    return await this.careRemindersRepository.count();
  }

  /**
   * Métodos adicionais para o controller
   * (Mesmo que não sejam usados atualmente)
   */
  async findByPlantId(plantId: string): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      where: { plant: { id: plantId } },
      relations: ['plant'],
    });
  }

  async findByType(type: string): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({
      where: { type },
      relations: ['plant'],
    });
  }

  async findAll(): Promise<CareReminder[]> {
    return await this.careRemindersRepository.find({ relations: ['plant'] });
  }
}
