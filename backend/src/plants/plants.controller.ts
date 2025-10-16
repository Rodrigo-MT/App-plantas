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
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { Plant } from './entities/plant.entity';

@ApiTags('plants')
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar uma nova planta',
    description: 'Cria um novo registro de planta no sistema' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Planta criada com sucesso', 
    type: Plant 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  create(@Body() createPlantDto: CreatePlantDto): Promise<Plant> {
    return this.plantsService.create(createPlantDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as plantas',
    description: 'Retorna uma lista de todas as plantas cadastradas' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de plantas retornada com sucesso', 
    type: [Plant] 
  })
  findAll(): Promise<Plant[]> {
    return this.plantsService.findAll();
  }

  @Get('location/:locationId')
  @ApiOperation({ 
    summary: 'Buscar plantas por localização',
    description: 'Retorna plantas de uma localização específica' 
  })
  @ApiParam({ 
    name: 'locationId', 
    description: 'UUID da localização',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plantas encontradas', 
    type: [Plant] 
  })
  findByLocation(@Param('locationId', ParseUUIDPipe) locationId: string): Promise<Plant[]> {
    return this.plantsService.findByLocation(locationId);
  }

  @Get('species/:speciesId')
  @ApiOperation({ 
    summary: 'Buscar plantas por espécie',
    description: 'Retorna plantas de uma espécie específica' 
  })
  @ApiParam({ 
    name: 'speciesId', 
    description: 'UUID da espécie',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plantas encontradas', 
    type: [Plant] 
  })
  findBySpecies(@Param('speciesId', ParseUUIDPipe) speciesId: string): Promise<Plant[]> {
    return this.plantsService.findBySpecies(speciesId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar planta por ID',
    description: 'Retorna os detalhes completos de uma planta específica' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da planta',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Planta encontrada', 
    type: Plant 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Planta não encontrada' 
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Plant> {
    return this.plantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar planta',
    description: 'Atualiza parcialmente os dados de uma planta existente' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da planta a ser atualizada',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Planta atualizada com sucesso', 
    type: Plant 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Planta não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ): Promise<Plant> {
    return this.plantsService.update(id, updatePlantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover planta',
    description: 'Remove permanentemente uma planta do sistema' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da planta a ser removida',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Planta removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Planta não encontrada' 
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.plantsService.remove(id);
  }
}