import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({ description: 'Nome científico da espécie', example: 'Monstera deliciosa' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Nome comum/popular da espécie', example: 'Costela de Adão' })
  @IsOptional()
  @IsString()
  commonName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Planta tropical com folhas grandes e recortadas.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Instruções de cuidado', example: 'Luz indireta, rega moderada.' })
  @IsOptional()
  @IsString()
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Condições ideais de cultivo', example: 'Sol parcial, umidade média.' })
  @IsOptional()
  @IsString()
  idealConditions?: string;

  @ApiPropertyOptional({ description: 'URL da foto da espécie', example: 'https://exemplo.com/especie.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;
}