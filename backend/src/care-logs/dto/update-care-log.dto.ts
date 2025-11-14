import { PartialType } from '@nestjs/mapped-types';
import { CreateCareLogDto, CareLogType } from './create-care-log.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';
import { IsNotFutureDate } from '../../common/validators/date.validators';

export class UpdateCareLogDto extends PartialType(CreateCareLogDto) {
  @ApiPropertyOptional({ description: 'Nome da planta associada', example: 'Rosa do Deserto' })
  plantName?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de cuidado realizado',
    example: 'pruning',
    enum: Object.values(CareLogType)
  })
  type?: CareLogType;

  @ApiPropertyOptional({ description: 'Data em que o cuidado foi realizado', example: '2024-01-16' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A data do cuidado só pode ser hoje ou uma data passada.' })
  date?: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Podou 3 galhos secos' })
  @IsOptional()
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações não pode ser vazio.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o cuidado foi realizado com sucesso', example: false })
  @IsOptional()
  @IsBoolean()
  success?: boolean;
}