import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantDto } from './create-plant.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlantDto extends PartialType(CreatePlantDto) {
  @ApiPropertyOptional({ description: 'Nome da planta', example: 'Novo Nome da Planta' })
  name?: string;

  @ApiPropertyOptional({ description: 'URL da imagem da planta', example: 'https://exemplo.com/nova-imagem.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Observações sobre a planta', example: 'Nova observação' })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Status de saúde da planta',
    example: 'healthy',
    enum: ['healthy', 'needs_care', 'sick']
  })
  healthStatus?: string;

  @ApiPropertyOptional({ description: 'Data de plantio', example: '2024-02-20' })
  plantingDate?: string;

  @ApiPropertyOptional({ description: 'ID da espécie', example: '123e4567-e89b-12d3-a456-426614174000' })
  speciesId?: string;

  @ApiPropertyOptional({ description: 'ID da localização', example: '123e4567-e89b-12d3-a456-426614174000' })
  locationId?: string;
}