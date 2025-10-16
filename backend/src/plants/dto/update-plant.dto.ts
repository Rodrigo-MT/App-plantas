import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantDto } from './create-plant.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class UpdatePlantDto extends PartialType(CreatePlantDto) {
  @ApiPropertyOptional({ description: 'Nome da planta', example: 'Novo Nome da Planta' })
  name?: string;

  @ApiPropertyOptional({ description: 'ID da espécie', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiPropertyOptional({ description: 'ID da localização', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Data de compra/plantio', example: '2024-02-20' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Observações sobre a planta', example: 'Nova observação' })
  notes?: string;

  @ApiPropertyOptional({ description: 'URL da foto da planta', example: 'https://exemplo.com/nova-foto.jpg' })
  photo?: string;
}