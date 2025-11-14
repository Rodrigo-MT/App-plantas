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

  @Get(':name/can-remove')
  @ApiOperation({ 
    summary: 'Verificar se espécie pode ser removida',
    description: 'Verifica se uma espécie não possui plantas associadas e pode ser removida (busca por nome)' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da espécie',
    example: 'Monstera deliciosa'
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
  async canBeRemoved(@Param('name') name: string): Promise<{ canBeRemoved: boolean; plantCount: number }> {
    const found = await this.speciesService.findByName(name);
    if (!found) throw new NotFoundException(`Espécie '${name}' não encontrada`);
    return this.speciesService.canBeRemoved(found.id);
  }

  @Get(':name')
  @ApiOperation({ 
    summary: 'Buscar espécie por nome',
    description: 'Retorna os detalhes completos de uma espécie específica pelo nome' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da espécie',
    example: 'Monstera deliciosa'
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
  async findOne(@Param('name') name: string): Promise<Species> {
    const found = await this.speciesService.findByName(name);
    if (!found) throw new NotFoundException(`Espécie '${name}' não encontrada`);
    return found;
  }

  @Patch(':name')
  @ApiOperation({ 
    summary: 'Atualizar espécie',
    description: 'Atualiza parcialmente os dados de uma espécie existente' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da espécie a ser atualizada',
    example: 'Monstera deliciosa'
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
  async update(
    @Param('name') name: string,
    @Body() updateSpeciesDto: UpdateSpeciesDto,
  ): Promise<Species> {
    const found = await this.speciesService.findByName(name);
    if (!found) throw new NotFoundException(`Espécie '${name}' não encontrada`);
    return this.speciesService.update(found.id, updateSpeciesDto);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover espécie',
    description: 'Remove permanentemente uma espécie do sistema' 
  })
  @ApiParam({ 
    name: 'name', 
    description: 'Nome da espécie a ser removida',
    example: 'Monstera deliciosa'
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
  async remove(@Param('name') name: string): Promise<void> {
    const found = await this.speciesService.findByName(name);
    if (!found) throw new NotFoundException(`Espécie '${name}' não encontrada`);
    return this.speciesService.remove(found.id);
  }
}