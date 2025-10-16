import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({ description: 'Nome da localização', example: 'Novo Nome do Local' })
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de ambiente',
    example: 'outdoor',
    enum: ['indoor', 'outdoor', 'greenhouse']
  })
  type?: string;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Nova descrição' })
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Nível de luz no local',
    example: 'medium',
    enum: ['low', 'medium', 'high']
  })
  lightLevel?: string;

  @ApiPropertyOptional({ 
    description: 'Nível de umidade no local',
    example: 'low',
    enum: ['low', 'medium', 'high']
  })
  humidity?: string;
}