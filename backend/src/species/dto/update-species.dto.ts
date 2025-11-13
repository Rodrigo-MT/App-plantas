import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeciesDto } from './create-species.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Matches, MaxLength, IsString, IsOptional } from 'class-validator';

export class UpdateSpeciesDto extends PartialType(CreateSpeciesDto) {
  @ApiPropertyOptional({ description: 'Nome científico da espécie', example: 'Novo Nome Científico' })
  @IsOptional()
  @IsString({ message: 'O nome científico deve ser um texto.' })
  @Matches(/^[^\d]+$/, { message: 'O nome científico não pode conter números.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nome comum/popular da espécie', example: 'Novo Nome Comum' })
  @IsOptional()
  @IsString({ message: 'O nome comum deve ser um texto.' })
  @Matches(/^[^\d]+$/, { message: 'O nome comum não pode conter números.' })
  commonName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Nova descrição' })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'Instruções de cuidado', example: 'Novas instruções de cuidado' })
  @IsOptional()
  @IsString({ message: 'As instruções de cuidado devem ser um texto.' })
  @MaxLength(500, { message: 'As instruções de cuidado devem ter no máximo 500 caracteres.' })
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Condições ideais de cultivo', example: 'Novas condições ideais' })
  @IsOptional()
  @IsString({ message: 'As condições ideais devem ser um texto.' })
  @MaxLength(500, { message: 'As condições ideais devem ter no máximo 500 caracteres.' })
  idealConditions?: string;

@ApiPropertyOptional({ 
  description: 'Imagem da espécie em formato Base64 (ex: data:image/jpeg;base64,...)',
  example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
})
@IsOptional()
@IsString({ message: 'A imagem deve ser um texto Base64 válido.' })
@Matches(/^data:image\/(jpeg|png|webp);base64,/, {
  message: 'A imagem deve estar em formato Base64 válido (data:image/...;base64,)',
})
photo?: string;

}
