import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({ description: 'Nome popular da espécie', example: 'Rosa do Deserto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Nome científico da espécie', example: 'Adenium obesum' })
  @IsString()
  scientificName: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Planta suculenta originária da África' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Frequência de rega recomendada',
    example: 'weekly',
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  })
  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly'])
  waterFrequency: string;

  @ApiProperty({ 
    description: 'Requisitos de luz solar',
    example: 'high',
    enum: ['low', 'medium', 'high']
  })
  @IsEnum(['low', 'medium', 'high'])
  lightRequirements: string;

  @ApiPropertyOptional({ description: 'Instruções específicas de cuidado', example: 'Evitar excesso de água no inverno' })
  @IsOptional()
  @IsString()
  careInstructions?: string;
}