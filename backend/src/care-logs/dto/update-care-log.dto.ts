import { PartialType } from '@nestjs/mapped-types';
import { CreateCareLogDto } from './create-care-log.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCareLogDto extends PartialType(CreateCareLogDto) {
  @ApiPropertyOptional({ 
    description: 'Tipo de cuidado realizado',
    example: 'pruning',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  type?: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Podou 3 galhos secos' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o cuidado foi realizado com sucesso', example: false })
  success?: boolean;

  @ApiPropertyOptional({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  plantId?: string;
}