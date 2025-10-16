import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({ description: 'Nome da localização', example: 'Novo Nome do Local' })
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de ambiente',
    example: 'outdoor',
    enum: ['indoor', 'outdoor', 'balcony', 'garden', 'terrace']
  })
  type?: string;

  @ApiPropertyOptional({ 
    description: 'Nível de luz solar',
    example: 'full',
    enum: ['full', 'partial', 'shade']
  })
  sunlight?: string;

  @ApiPropertyOptional({ 
    description: 'Nível de umidade',
    example: 'high',
    enum: ['low', 'medium', 'high']
  })
  humidity?: string;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Nova descrição' })
  description?: string;

  @ApiPropertyOptional({ description: 'URL da foto da localização', example: 'https://exemplo.com/nova-foto.jpg' })
  photo?: string;
}