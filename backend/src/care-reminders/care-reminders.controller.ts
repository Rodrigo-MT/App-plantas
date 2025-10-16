import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CareRemindersService } from './care-reminders.service';
import { CreateCareReminderDto } from './dto/create-care-reminder.dto';
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
    name: 'plantId', 
    required: false,
    description: 'Filtrar por ID da planta',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false,
    description: 'Filtrar por tipo de cuidado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de lembretes retornada com sucesso', 
    type: [CareReminder] 
  })
  findAll(
    @Query('plantId') plantId?: string,
    @Query('type') type?: string,
  ): Promise<CareReminder[]> {
    if (plantId) {
      return this.careRemindersService.findByPlantId(plantId);
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

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar lembrete por ID',
    description: 'Retorna os detalhes completos de um lembrete específico' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do lembrete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembrete encontrado', 
    type: CareReminder 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CareReminder> {
    return this.careRemindersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar lembrete',
    description: 'Atualiza parcialmente os dados de um lembrete existente' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do lembrete a ser atualizado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCareReminderDto: UpdateCareReminderDto,
  ): Promise<CareReminder> {
    return this.careRemindersService.update(id, updateCareReminderDto);
  }

  @Patch(':id/mark-done')
  @ApiOperation({ 
    summary: 'Marcar lembrete como concluído',
    description: 'Marca um lembrete como feito e atualiza a próxima data' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do lembrete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lembrete marcado como concluído', 
    type: CareReminder 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  markAsDone(@Param('id', ParseUUIDPipe) id: string): Promise<CareReminder> {
    return this.careRemindersService.markAsDone(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover lembrete',
    description: 'Remove permanentemente um lembrete do sistema' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do lembrete a ser removido',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Lembrete removido com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Lembrete não encontrado' 
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.careRemindersService.remove(id);
  }
}