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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar nova localização',
    description: 'Cria um novo local para posicionar plantas' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Localização criada com sucesso', 
    type: Location 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as localizações',
    description: 'Retorna todas as localizações cadastradas no sistema' 
  })
  @ApiQuery({ 
    name: 'type', 
    required: false,
    description: 'Filtrar por tipo de ambiente',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'balcony', 'garden', 'terrace']
  })
  @ApiQuery({ 
    name: 'sunlight', 
    required: false,
    description: 'Filtrar por nível de luz solar',
    example: 'partial',
    enum: ['full', 'partial', 'shade']
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de localizações retornada com sucesso', 
    type: [Location] 
  })
  findAll(
    @Query('type') type?: string,
    @Query('sunlight') sunlight?: string,
  ): Promise<Location[]> {
    if (type) {
      return this.locationsService.findByType(type);
    }
    if (sunlight) {
      return this.locationsService.findBySunlight(sunlight);
    }
    return this.locationsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estatísticas de localizações',
    description: 'Retorna contagem de plantas por localização' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Estatísticas calculadas com sucesso',
    schema: {
      example: [
        { locationId: '123e4567-e89b-12d3-a456-426614174000', locationName: 'Sala', plantCount: 5 },
        { locationId: '123e4567-e89b-12d3-a456-426614174001', locationName: 'Quintal', plantCount: 3 }
      ]
    }
  })
  getStats(): Promise<{ locationId: string; locationName: string; plantCount: number }[]> {
    return this.locationsService.getLocationStats();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar localização por ID',
    description: 'Retorna os detalhes completos de uma localização específica' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da localização',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Localização encontrada', 
    type: Location 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Localização não encontrada' 
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Location> {
    return this.locationsService.findOne(id);
  }

  @Get(':id/is-empty')
  @ApiOperation({ 
    summary: 'Verificar se localização está vazia',
    description: 'Verifica se uma localização não possui plantas associadas' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da localização',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Status de vazio retornado',
    schema: {
      example: { isEmpty: true }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Localização não encontrada' 
  })
  async isEmpty(@Param('id', ParseUUIDPipe) id: string): Promise<{ isEmpty: boolean }> {
    const isEmpty = await this.locationsService.isEmpty(id);
    return { isEmpty };
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar localização',
    description: 'Atualiza parcialmente os dados de uma localização existente' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da localização a ser atualizada',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Localização atualizada com sucesso', 
    type: Location 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Localização não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover localização',
    description: 'Remove permanentemente uma localização do sistema' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da localização a ser removida',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Localização removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Localização não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Localização não pode ser removida pois possui plantas associadas' 
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.locationsService.remove(id);
  }
}