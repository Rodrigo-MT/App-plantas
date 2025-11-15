import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeciesDto } from './create-species.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class UpdateSpeciesDto extends PartialType(CreateSpeciesDto) {
  @ApiPropertyOptional({ description: 'Nome científico da espécie', example: 'Novo Nome Científico' })
  @IsOptional()
  @IsString({ message: 'O nome científico deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome científico não pode ser vazio.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome científico não pode conter números nem caracteres especiais.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nome comum/popular da espécie', example: 'Novo Nome Comum' })
  @IsOptional()
  @IsString({ message: 'O nome comum deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome comum não pode ser vazio.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome comum não pode conter números nem caracteres especiais.' })
  commonName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Nova descrição' })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'Instruções de cuidado', example: 'Novas instruções de cuidado' })
  @IsOptional()
  @IsString({ message: 'As instruções de cuidado devem ser um texto.' })
  @IsNotEmpty({ message: 'As instruções de cuidado não podem ser vazias.' })
  @MaxLength(500, { message: 'As instruções de cuidado devem ter no máximo 500 caracteres.' })
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Condições ideais de cultivo', example: 'Novas condições ideais' })
  @IsOptional()
  @IsString({ message: 'As condições ideais devem ser um texto.' })
  @IsNotEmpty({ message: 'As condições ideais não podem ser vazias.' })
  @MaxLength(500, { message: 'As condições ideais devem ter no máximo 500 caracteres.' })
  idealConditions?: string;

  @ApiPropertyOptional({ description: 'URL da foto da espécie', example: 'https://exemplo.com/nova-foto.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;
}