import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeciesDto } from './create-species.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpeciesDto extends PartialType(CreateSpeciesDto) {
  @ApiPropertyOptional({ description: 'Nome científico da espécie', example: 'Novo Nome Científico' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nome comum/popular da espécie', example: 'Novo Nome Comum' })
  commonName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Nova descrição' })
  description?: string;

  @ApiPropertyOptional({ description: 'Instruções de cuidado', example: 'Novas instruções de cuidado' })
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Condições ideais de cultivo', example: 'Novas condições ideais' })
  idealConditions?: string;

  @ApiPropertyOptional({ description: 'URL da foto da espécie', example: 'https://exemplo.com/nova-foto.jpg' })
  photo?: string;
}