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
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
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
    description: 'Dados inválidos fornecidos ou nome duplicado' 
  })
  create(@Body() createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    return this.speciesService.create(createSpeciesDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as espécies',
    description: 'Retorna todas as espécies cadastradas no sistema' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de espécies retornada com sucesso', 
    type: [Species] 
  })
  findAll(): Promise<Species[]> {
    return this.speciesService.findAll();
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
    description: 'Dados inválidos fornecidos ou nome duplicado' 
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