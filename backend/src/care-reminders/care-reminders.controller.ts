import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  NotFoundException,
  HttpStatus,
  HttpCode,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CareRemindersService } from './care-reminders.service';
import { CreateCareReminderDto, CareReminderType } from './dto/create-care-reminder.dto';
import { UpdateCareReminderDto } from './dto/update-care-reminder.dto';
import { CareReminder } from './entities/care-reminder.entity';

@ApiTags('care-reminders')
@Controller('care-reminders')
export class CareRemindersController {
  constructor(private readonly careRemindersService: CareRemindersService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo lembrete',
    description: 'Cria um novo lembrete de cuidado. Exemplo válido: { plantName: "Rosa do Deserto", type: "watering", frequency: 7, lastDone: "2025-11-15", nextDue: "2025-12-01", isActive: true }' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Lembrete criado com sucesso', 
    type: CareReminder 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  create(@Body() createCareReminderDto: CreateCareReminderDto): Promise<CareReminder> {
    return this.careRemindersService.create(createCareReminderDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os lembretes',
    description: 'Retorna todos os lembretes de cuidado cadastrados'
  })
  @ApiQuery({ 
    name: 'plantName', 
    required: false,
    description: 'Filtrar por nome da planta',
    example: 'Rosa do Deserto'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false,
    description: 'Filtrar por tipo de cuidado',
    example: 'watering',
    enum: Object.values(CareReminderType)
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de lembretes retornada com sucesso', 
    type: [CareReminder],
    schema: {
      example: [
        { id: 'uuid1', plantId: 'uuidp1', type: 'watering', frequency: 7, lastDone: '2025-11-15', nextDue: '2025-12-01', isActive: true },
        { id: 'uuid2', plantId: 'uuidp2', type: 'pruning', frequency: 30, lastDone: '2025-11-10', nextDue: '2025-12-10', isActive: true }
      ]
    }
  })
  findAll(
    @Query('plantName') plantName?: string,
    @Query('type') type?: string,
  ): Promise<CareReminder[]> {
    if (plantName) {
      return this.careRemindersService.findByPlantName(plantName);
    }
    if (type) {
      return this.careRemindersService.findByType(type);
    }
    return this.careRemindersService.findAll();
  }

  @Get('overdue')
  @ApiOperation({ 
    summary: 'Lembretes já realizados (passados ou hoje)',
    description: 'Retorna lembretes ativos com lastDone <= hoje. Útil para histórico recente.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembretes com lastDone passado ou hoje retornados com sucesso', 
    type: [CareReminder],
    schema: {
      example: [
        {
          id: 'b4f1c2c0-1111-2222-3333-444455556666',
          plantId: 'a1b2c3d4-9999-8888-7777-666655554444',
          type: 'watering',
          frequency: 7,
          lastDone: '2025-11-15',
          nextDue: '2025-12-01',
          isActive: true
        }
      ]
    }
  })
  findOverdue(): Promise<CareReminder[]> {
    return this.careRemindersService.findOverdue();
  }

  @Get('upcoming')
  @ApiOperation({ 
    summary: 'Lembretes futuros',
    description: 'Retorna lembretes ativos com nextDue > hoje (somente futuro).' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembretes futuros retornados com sucesso', 
    type: [CareReminder],
    schema: {
      example: [
        {
          id: 'c7e8f9a0-1234-5678-9101-abcdefabcdef',
          plantId: 'a1b2c3d4-9999-8888-7777-666655554444',
          type: 'fertilizing',
          frequency: 30,
          lastDone: '2025-11-01',
          nextDue: '2025-12-10',
          isActive: true
        }
      ]
    }
  })
  findUpcoming(): Promise<CareReminder[]> {
    return this.careRemindersService.findUpcoming();
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Lembretes ativos',
    description: 'Retorna todos os lembretes ativos' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembretes ativos encontrados', 
    type: [CareReminder] 
  })
  findActive(): Promise<CareReminder[]> {
    return this.careRemindersService.findActive();
  }

  @Get(':plantName/:type/:nextDue')
  @ApiOperation({ 
    summary: 'Buscar lembrete por identificador composto',
    description: 'Retorna os detalhes completos de um lembrete específico pelo identificador composto (plantName, type, nextDue)' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do lembrete', example: 'watering' })
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2025-12-01' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembrete encontrado', 
    type: CareReminder 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  async findOne(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('nextDue') nextDue: string,
  ): Promise<CareReminder> {
    return this.careRemindersService.findOneByComposite(plantName, type, nextDue);
  }

  @Patch(':plantName/:type/:nextDue')
  @ApiOperation({ 
    summary: 'Atualizar lembrete por identificador composto',
    description: 'Atualiza parcialmente os dados de um lembrete usando identificador composto (plantName, type, nextDue). Observação: plantName, type e nextDue são imutáveis no PATCH.' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do lembrete', example: 'watering' })
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2025-12-01' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembrete atualizado com sucesso', 
    type: CareReminder 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  async update(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('nextDue') nextDue: string,
    @Body() updateCareReminderDto: UpdateCareReminderDto,
  ): Promise<CareReminder> {
    // resolve composite -> id then call update
    const reminder = await this.careRemindersService.findOneByComposite(plantName, type, nextDue);
    return this.careRemindersService.update(reminder.id, updateCareReminderDto);
  }

  // Endpoint de marcar como concluído foi removido a pedido do usuário

  @Delete(':plantName/:type/:nextDue')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover lembrete',
    description: 'Remove permanentemente um lembrete do sistema' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do lembrete', example: 'watering' })
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2025-11-22' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Lembrete removido com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  async remove(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('nextDue') nextDue: string,
  ): Promise<void> {
    return this.careRemindersService.removeByComposite(plantName, type, nextDue);
  }
}