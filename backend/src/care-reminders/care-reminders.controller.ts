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
    description: 'Cria um novo lembrete de cuidado para uma planta' 
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
    type: [CareReminder] 
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
    summary: 'Lembretes atrasados',
    description: 'Retorna lembretes com data de vencimento no passado' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembretes atrasados encontrados', 
    type: [CareReminder] 
  })
  findOverdue(): Promise<CareReminder[]> {
    return this.careRemindersService.findOverdue();
  }

  @Get('upcoming')
  @ApiOperation({ 
    summary: 'Lembretes próximos',
    description: 'Retorna lembretes com vencimento em até 3 dias' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembretes próximos encontrados', 
    type: [CareReminder] 
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
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2024-01-20' })
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
    description: 'Atualiza parcialmente os dados de um lembrete usando identificador composto (plantName, type, nextDue)' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do lembrete', example: 'watering' })
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2024-01-20' })
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

  @Patch(':plantName/:type/:nextDue/mark-done')
  @ApiOperation({ 
    summary: 'Marcar lembrete como concluído por identificador composto',
    description: 'Marca um lembrete como feito e atualiza a próxima data usando identificador composto' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do lembrete', example: 'watering' })
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2024-01-20' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembrete marcado como concluído', 
    type: CareReminder 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  async markAsDone(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('nextDue') nextDue: string,
  ): Promise<CareReminder> {
    return this.careRemindersService.markAsDoneByComposite(plantName, type, nextDue);
  }

  @Delete(':plantName/:type/:nextDue')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover lembrete',
    description: 'Remove permanentemente um lembrete do sistema' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do lembrete', example: 'watering' })
  @ApiParam({ name: 'nextDue', description: 'Data do próximo vencimento (YYYY-MM-DD)', example: '2024-01-20' })
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