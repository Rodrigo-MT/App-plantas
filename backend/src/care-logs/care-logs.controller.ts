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
import { CareLogsService } from './care-logs.service';
import { CreateCareLogDto } from './dto/create-care-log.dto';
import { UpdateCareLogDto } from './dto/update-care-log.dto';
import { CareLog } from './entities/care-log.entity';

@ApiTags('care-logs')
@Controller('care-logs')
export class CareLogsController {
  constructor(private readonly careLogsService: CareLogsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo log de cuidado',
    description: 'Registra um novo cuidado realizado em uma planta' 
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
    name: 'plantId', 
    required: false,
    description: 'Filtrar por ID da planta',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de logs retornada com sucesso', 
    type: [CareLog] 
  })
  findAll(@Query('plantId') plantId?: string): Promise<CareLog[]> {
    if (plantId) {
      return this.careLogsService.findByPlantId(plantId);
    }
    return this.careLogsService.findAll();
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

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar log por ID',
    description: 'Retorna os detalhes completos de um log específico' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do log',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Log encontrado', 
    type: CareLog 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Log não encontrado' 
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CareLog> {
    return this.careLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar log',
    description: 'Atualiza parcialmente os dados de um log existente' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do log a ser atualizado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCareLogDto: UpdateCareLogDto,
  ): Promise<CareLog> {
    return this.careLogsService.update(id, updateCareLogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover log',
    description: 'Remove permanentemente um log do sistema' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID do log a ser removido',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Log removido com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Log não encontrado' 
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.careLogsService.remove(id);
  }
}