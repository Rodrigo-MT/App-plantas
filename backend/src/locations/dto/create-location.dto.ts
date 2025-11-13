import { IsString, IsEnum, IsNotEmpty, MaxLength, IsOptional, Matches } from 'class-validator';
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
  @ApiProperty({ description: 'Nome do local', example: 'Sala de Estar', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'O nome do local é obrigatório' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Tipo de ambiente',
    enum: LocationType,
    example: LocationType.INDOOR,
  })
  @IsEnum(LocationType, { message: 'Tipo de local inválido' })
  type: LocationType;

  @ApiProperty({
    description: 'Nível de luz solar',
    enum: SunlightLevel,
    example: SunlightLevel.PARTIAL,
  })
  @IsEnum(SunlightLevel, { message: 'Nível de luz inválido' })
  sunlight: SunlightLevel;

  @ApiProperty({
    description: 'Nível de umidade',
    enum: HumidityLevel,
    example: HumidityLevel.MEDIUM,
  })
  @IsEnum(HumidityLevel, { message: 'Nível de umidade inválido' })
  humidity: HumidityLevel;

  @ApiProperty({
    description: 'Descrição da localização',
    example: 'Ambiente interno com luz indireta e temperatura estável.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  description: string;

  @ApiPropertyOptional({ 
    description: 'Imagem do local em formato compatível (ex: data:image/jpeg;base64,...)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...'
  })
  @IsOptional()
  @IsString({ message: 'A imagem deve ser em formato compatível' })
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, {
    message: 'A imagem deve estar em formato Base64 válido (data:image/...;base64,)',
  })
  photo?: string;
}
