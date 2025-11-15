import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotFutureDate } from '../../common/validators/date.validators';

export enum CareLogType {
  WATERING = 'watering',
  FERTILIZING = 'fertilizing',
  PRUNING = 'pruning',
  REPOTTING = 'repotting',
  CLEANING = 'cleaning',
  OTHER = 'other',
}

export class CreateCareLogDto {
  @ApiProperty({ description: 'Nome da planta associada', example: 'Rosa do Deserto' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da planta é obrigatório.' })
  plantName: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado realizado',
    example: 'watering',
    enum: Object.values(CareLogType)
  })
  @IsEnum(CareLogType)
  type: CareLogType;

  // Exemplo usa data de HOJE (válida para log de cuidado)
  @ApiProperty({ description: 'Data em que o cuidado foi realizado (YYYY-MM-DD)', example: '2025-11-15' })
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A data do cuidado só pode ser hoje ou uma data passada.' })
  date: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Regada com 500ml de água filtrada', maxLength: 500 })
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações é obrigatório.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ description: 'URL da foto ou data URI (data:image/...)', example: 'https://example.com/regababosa.jpg' })
  @IsOptional()
  @IsString({ message: 'A foto deve ser uma string (URL ou data URI).' })
  photo?: string;

  @ApiProperty({ description: 'Indica se o cuidado foi realizado com sucesso', example: true })
  @IsBoolean()
  success: boolean;
}