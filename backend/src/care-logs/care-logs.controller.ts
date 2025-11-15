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
import { CareLogsService } from './care-logs.service';
import { CreateCareLogDto, CareLogType } from './dto/create-care-log.dto';
import { UpdateCareLogDto } from './dto/update-care-log.dto';
import { CareLog } from './entities/care-log.entity';

@ApiTags('care-logs')
@Controller('care-logs')
export class CareLogsController {
  constructor(private readonly careLogsService: CareLogsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo log de cuidado',
    description: 'Registra um novo cuidado. Exemplo válido: { plantName: "Rosa do Deserto", type: "watering", date: "2025-11-15", success: true, notes: "Regada com 500ml" }' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Log criado com sucesso', 
    type: CareLog 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  create(@Body() createCareLogDto: CreateCareLogDto): Promise<CareLog> {
    return this.careLogsService.create(createCareLogDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os logs',
    description: 'Retorna todos os logs de cuidado cadastrados'
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
    enum: Object.values(CareLogType)
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de logs retornada com sucesso', 
    type: [CareLog],
    schema: {
      example: [
        { id: 'log1', plantId: 'uuidp1', type: 'watering', date: '2025-11-15', success: true, notes: 'Regada com 500ml' },
        { id: 'log2', plantId: 'uuidp2', type: 'pruning', date: '2025-11-14', success: true, notes: 'Podou 2 folhas danificadas' }
      ]
    }
  })
  findAll(
    @Query('plantName') plantName?: string,
    @Query('type') type?: string,
  ): Promise<CareLog[]> {
    if (plantName) {
      return this.careLogsService.findByPlantName(plantName);
    }
    if (type) {
      return this.careLogsService.findByType(type);
    }
    return this.careLogsService.findAll();
  }

  @Get('recent')
  @ApiOperation({ 
    summary: 'Logs recentes',
    description: 'Retorna logs dos últimos 30 dias' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logs recentes encontrados', 
    type: [CareLog] 
  })
  findRecent(): Promise<CareLog[]> {
    return this.careLogsService.findRecent();
  }

  @Get('successful')
  @ApiOperation({ 
    summary: 'Logs bem-sucedidos',
    description: 'Retorna apenas os cuidados realizados com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logs bem-sucedidos encontrados', 
    type: [CareLog] 
  })
  findSuccessful(): Promise<CareLog[]> {
    return this.careLogsService.findSuccessful();
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estatísticas de cuidados',
    description: 'Retorna contagem de cuidados realizados por tipo' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Estatísticas calculadas com sucesso',
    schema: {
      example: [{ type: 'watering', count: 15 }, { type: 'pruning', count: 3 }]
    }
  })
  getStats(): Promise<{ type: string; count: number }[]> {
    return this.careLogsService.getCareStats();
  }

  @Get(':plantName/:type/:date')
  @ApiOperation({ 
    summary: 'Buscar log por identificador composto',
    description: 'Retorna os detalhes completos de um log específico pelo identificador composto (plantName, type, date)' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do cuidado', example: 'watering' })
  @ApiParam({ name: 'date', description: 'Data do cuidado (YYYY-MM-DD)', example: '2025-11-15' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Log encontrado', 
    type: CareLog 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Log não encontrado' 
  })
  async findOne(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('date') date: string,
  ): Promise<CareLog> {
    return this.careLogsService.findOneByComposite(plantName, type, date);
  }

  @Patch(':plantName/:type/:date')
  @ApiOperation({ 
    summary: 'Atualizar log por identificador composto',
    description: 'Atualiza parcialmente os dados de um log usando identificador composto (plantName, type, date). Observação: plantName, type e date são imutáveis no PATCH.' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do cuidado', example: 'watering' })
  @ApiParam({ name: 'date', description: 'Data do cuidado (YYYY-MM-DD)', example: '2025-11-15' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Log atualizado com sucesso', 
    type: CareLog 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Log não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  async update(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('date') date: string,
    @Body() updateCareLogDto: UpdateCareLogDto,
  ): Promise<CareLog> {
    const careLog = await this.careLogsService.findOneByComposite(plantName, type, date);
    return this.careLogsService.update(careLog.id, updateCareLogDto);
  }

  @Delete(':plantName/:type/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover log',
    description: 'Remove permanentemente um log do sistema' 
  })
  @ApiParam({ name: 'plantName', description: 'Nome da planta', example: 'Rosa do Deserto' })
  @ApiParam({ name: 'type', description: 'Tipo do cuidado', example: 'watering' })
  @ApiParam({ name: 'date', description: 'Data do cuidado (YYYY-MM-DD)', example: '2025-11-15' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Log removido com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Log não encontrado' 
  })
  async remove(
    @Param('plantName') plantName: string,
    @Param('type') type: string,
    @Param('date') date: string,
  ): Promise<void> {
    return this.careLogsService.removeByComposite(plantName, type, date);
  }
}