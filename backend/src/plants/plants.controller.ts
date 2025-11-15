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
import { PlantsService } from './plants.service';
import { LocationsService } from '../locations/locations.service';
import { SpeciesService } from '../species/species.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { Plant } from './entities/plant.entity';

@ApiTags('plants')
@Controller('plants')
export class PlantsController {
  constructor(
    private readonly plantsService: PlantsService,
    private readonly locationsService: LocationsService,
    private readonly speciesService: SpeciesService,
  ) {}

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

  @Get('location/:locationName')
  @ApiOperation({ 
    summary: 'Buscar plantas por localização',
    description: 'Retorna plantas de uma localização específica' 
  })
  @ApiParam({ 
    name: 'locationName', 
    description: 'Nome da localização',
    example: 'Sala de Estar'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plantas encontradas', 
    type: [Plant] 
  })
  async findByLocation(@Param('locationName') locationName: string): Promise<Plant[]> {
    const found = await this.locationsService.findByName(locationName);
    if (!found) throw new NotFoundException(`Localização '${locationName}' não encontrada`);
    return this.plantsService.findByLocation(found.id);
  }

  @Get('species/:speciesName')
  @ApiOperation({ 
    summary: 'Buscar plantas por espécie',
    description: 'Retorna plantas de uma espécie específica' 
  })
  @ApiParam({ 
    name: 'speciesName', 
    description: 'Nome da espécie',
    example: 'Monstera deliciosa'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Plantas encontradas', 
    type: [Plant] 
  })
  async findBySpecies(@Param('speciesName') speciesName: string): Promise<Plant[]> {
    const found = await this.speciesService.findByName(speciesName);
    if (!found) throw new NotFoundException(`Espécie '${speciesName}' não encontrada`);
    return this.plantsService.findBySpecies(found.id);
  }

  @Get(':name')
  @ApiOperation({ 
    summary: 'Buscar planta por ID',
    description: 'Retorna os detalhes completos de uma planta específica pelo nome' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da planta',
    example: 'Rosa do Deserto'
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
  async findOne(@Param('name') name: string): Promise<Plant> {
    const found = await this.plantsService.findByName(name);
    if (!found) throw new NotFoundException(`Planta '${name}' não encontrada`);
    return found;
  }

  @Patch(':name')
  @ApiOperation({ 
    summary: 'Atualizar planta',
    description: 'Atualiza parcialmente os dados de uma planta existente' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da planta a ser atualizada',
    example: 'Rosa do Deserto'
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
  async update(
    @Param('name') name: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ): Promise<Plant> {
    const found = await this.plantsService.findByName(name);
    if (!found) throw new NotFoundException(`Planta '${name}' não encontrada`);
    return this.plantsService.update(found.id, updatePlantDto);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover planta',
    description: 'Remove permanentemente uma planta do sistema' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da planta a ser removida',
    example: 'Rosa do Deserto'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Planta removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Planta não encontrada' 
  })
  async remove(@Param('name') name: string): Promise<void> {
    const found = await this.plantsService.findByName(name);
    if (!found) throw new NotFoundException(`Planta '${name}' não encontrada`);
    return this.plantsService.remove(found.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover todas as plantas',
    description: 'Remove todas as plantas e dados relacionados (lembretes e logs) em uma operação segura.'
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Todas as plantas e dados relacionados foram removidos' })
  async removeAll(): Promise<void> {
    return this.plantsService.removeAll();
  }
}