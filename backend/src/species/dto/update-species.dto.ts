import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeciesDto } from './create-species.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpeciesDto extends PartialType(CreateSpeciesDto) {
  @ApiPropertyOptional({ description: 'Nome popular da espécie', example: 'Novo Nome da Espécie' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nome científico da espécie', example: 'Novus scientificus' })
  scientificName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Nova descrição' })
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Frequência de rega recomendada',
    example: 'biweekly',
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  })
  waterFrequency?: string;

  @ApiPropertyOptional({ 
    description: 'Requisitos de luz solar',
    example: 'medium',
    enum: ['low', 'medium', 'high']
  })
  lightRequirements?: string;

  @ApiPropertyOptional({ description: 'Instruções específicas de cuidado', example: 'Novas instruções' })
  careInstructions?: string;
}