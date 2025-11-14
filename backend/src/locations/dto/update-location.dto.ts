import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto, LocationType, SunlightLevel, HumidityLevel } from './create-location.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({ description: 'Nome da localização', example: 'Novo Nome do Local' })
  @IsOptional()
  @IsString({ message: 'O nome da localização deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da localização não pode ser vazio.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/, { message: 'O nome da localização contém caracteres inválidos.' })
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de ambiente',
    example: 'outdoor',
    enum: Object.values(LocationType)
  })
  type?: LocationType;

  @ApiPropertyOptional({ 
    description: 'Nível de luz solar',
    example: 'full',
    enum: Object.values(SunlightLevel)
  })
  sunlight?: SunlightLevel;

  @ApiPropertyOptional({ 
    description: 'Nível de umidade',
    example: 'high',
    enum: Object.values(HumidityLevel)
  })
  humidity?: HumidityLevel;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Nova descrição' })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'URL da foto da localização', example: 'https://exemplo.com/nova-foto.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;
}