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
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Species } from './entities/species.entity';

@ApiTags('species')
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar nova espécie',
    description: 'Cria uma nova espécie de planta no sistema' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Espécie criada com sucesso', 
    type: Species 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos ou nome científico duplicado' 
  })
  create(@Body() createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    return this.speciesService.create(createSpeciesDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as espécies',
    description: 'Retorna todas as espécies cadastradas no sistema' 
  })
  @ApiQuery({ 
    name: 'lightRequirements', 
    required: false,
    description: 'Filtrar por requisitos de luz',
    example: 'low',
    enum: ['low', 'medium', 'high']
  })
  @ApiQuery({ 
    name: 'waterFrequency', 
    required: false,
    description: 'Filtrar por frequência de rega',
    example: 'weekly',
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de espécies retornada com sucesso', 
    type: [Species] 
  })
  findAll(
    @Query('lightRequirements') lightRequirements?: string,
    @Query('waterFrequency') waterFrequency?: string,
  ): Promise<Species[]> {
    if (lightRequirements) {
      return this.speciesService.findByLightRequirements(lightRequirements);
    }
    if (waterFrequency) {
      return this.speciesService.findByWaterFrequency(waterFrequency);
    }
    return this.speciesService.findAll();
  }

  @Get('stats/light-requirements')
  @ApiOperation({ 
    summary: 'Estatísticas de requisitos de luz',
    description: 'Retorna contagem de espécies por requisitos de luz' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Estatísticas calculadas com sucesso',
    schema: {
      example: [
        { lightRequirements: 'low', count: 5 },
        { lightRequirements: 'medium', count: 8 },
        { lightRequirements: 'high', count: 3 }
      ]
    }
  })
  getLightRequirementsStats(): Promise<{ lightRequirements: string; count: number }[]> {
    return this.speciesService.getLightRequirementsStats();
  }

  @Get('stats/water-frequency')
  @ApiOperation({ 
    summary: 'Estatísticas de frequência de rega',
    description: 'Retorna contagem de espécies por frequência de rega' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Estatísticas calculadas com sucesso',
    schema: {
      example: [
        { waterFrequency: 'daily', count: 2 },
        { waterFrequency: 'weekly', count: 10 },
        { waterFrequency: 'biweekly', count: 4 }
      ]
    }
  })
  getWaterFrequencyStats(): Promise<{ waterFrequency: string; count: number }[]> {
    return this.speciesService.getWaterFrequencyStats();
  }

  @Get('easy-care')
  @ApiOperation({ 
    summary: 'Espécies fáceis de cuidar',
    description: 'Retorna espécies consideradas fáceis de cuidar (baixa manutenção)' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Espécies fáceis de cuidar encontradas', 
    type: [Species] 
  })
  findEasyCareSpecies(): Promise<Species[]> {
    return this.speciesService.findEasyCareSpecies();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar espécie por ID',
    description: 'Retorna os detalhes completos de uma espécie específica' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da espécie',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Espécie encontrada', 
    type: Species 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Espécie não encontrada' 
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Species> {
    return this.speciesService.findOne(id);
  }

  @Get(':id/can-remove')
  @ApiOperation({ 
    summary: 'Verificar se espécie pode ser removida',
    description: 'Verifica se uma espécie não possui plantas associadas e pode ser removida' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da espécie',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Status de remoção retornado',
    schema: {
      example: { canBeRemoved: true, plantCount: 0 }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Espécie não encontrada' 
  })
  canBeRemoved(@Param('id', ParseUUIDPipe) id: string): Promise<{ canBeRemoved: boolean; plantCount: number }> {
    return this.speciesService.canBeRemoved(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar espécie',
    description: 'Atualiza parcialmente os dados de uma espécie existente' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da espécie a ser atualizada',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Espécie atualizada com sucesso', 
    type: Species 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Espécie não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos ou nome científico duplicado' 
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSpeciesDto: UpdateSpeciesDto,
  ): Promise<Species> {
    return this.speciesService.update(id, updateSpeciesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover espécie',
    description: 'Remove permanentemente uma espécie do sistema' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID da espécie a ser removida',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Espécie removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Espécie não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Espécie não pode ser removida pois possui plantas associadas' 
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.speciesService.remove(id);
  }
}