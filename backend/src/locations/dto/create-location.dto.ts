import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LocationType {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  BALCONY = 'balcony',
  GARDEN = 'garden',
  TERRACE = 'terrace',
}

export enum SunlightLevel {
  FULL = 'full',
  PARTIAL = 'partial',
  SHADE = 'shade',
}

export enum HumidityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateLocationDto {
  @ApiProperty({ description: 'Nome da localização', example: 'Sala de Estar' })
  @IsString({ message: 'O nome da localização deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da localização é obrigatório.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/, { message: 'O nome da localização contém caracteres inválidos.' })
  name: string;
  //Em Locations, preferi manter  nomes com números, pois pode-se existir Sala 1, Sala 2, etc...
  @ApiProperty({ 
    description: 'Tipo de ambiente',
    example: 'indoor',
    enum: Object.values(LocationType)
  })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiProperty({ 
    description: 'Nível de luz solar',
    example: 'partial',
    enum: Object.values(SunlightLevel)
  })
  @IsEnum(SunlightLevel)
  sunlight: SunlightLevel;

  @ApiProperty({ 
    description: 'Nível de umidade',
    example: 'medium',
    enum: Object.values(HumidityLevel)
  })
  @IsEnum(HumidityLevel)
  humidity: HumidityLevel;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Ambiente interno com luz indireta' })
  @IsString({ message: 'Descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição da localização é obrigatória.' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
  description?: string;

  @ApiPropertyOptional({ description: 'URL da foto da localização', example: 'https://exemplo.com/localizacao.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;
}