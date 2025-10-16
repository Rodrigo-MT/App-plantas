import { PartialType } from '@nestjs/mapped-types';
import { CreateCareLogDto } from './create-care-log.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCareLogDto extends PartialType(CreateCareLogDto) {
  @ApiPropertyOptional({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  plantId?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de cuidado realizado',
    example: 'pruning',
    enum: ['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other']
  })
  type?: string;

  @ApiPropertyOptional({ description: 'Data em que o cuidado foi realizado', example: '2024-01-16' })
  date?: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Podou 3 galhos secos' })
  notes?: string;

  @ApiPropertyOptional({ description: 'URL da foto do cuidado realizado', example: 'https://exemplo.com/nova-foto.jpg' })
  photo?: string;

  @ApiPropertyOptional({ description: 'Indica se o cuidado foi realizado com sucesso', example: false })
  success?: boolean;
}