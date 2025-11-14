import { IsString, IsOptional, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({ description: 'Nome científico da espécie', example: 'Monstera deliciosa' })
  @IsString({ message: 'O nome científico deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome científico é obrigatório.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome científico não pode conter números nem caracteres especiais.' })
  name: string;

  @ApiPropertyOptional({ description: 'Nome comum/popular da espécie', example: 'Costela de Adão' })
  @IsString({ message: 'O nome comum deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome comum é obrigatório.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome comum não pode conter números nem caracteres especiais.' })
  commonName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Planta tropical com folhas grandes e recortadas.', maxLength: 500 })
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'Instruções de cuidado', example: 'Luz indireta, rega moderada.', maxLength: 500 })
  @IsString({ message: 'Instruções de cuidado deve ser um texto.' })
  @IsNotEmpty({ message: 'As instruções de cuidado são obrigatórias.' })
  @MaxLength(500, { message: 'As instruções de cuidado devem ter no máximo 500 caracteres.' })
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Condições ideais de cultivo', example: 'Sol parcial, umidade média.', maxLength: 500 })
  @IsString({ message: 'Condições ideais deve ser um texto.' })
  @IsNotEmpty({ message: 'As condições ideais são obrigatórias.' })
  @MaxLength(500, { message: 'As condições ideais devem ter no máximo 500 caracteres.' })
  idealConditions?: string;

  @ApiPropertyOptional({ description: 'URL da foto da espécie', example: 'https://exemplo.com/especie.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;
}