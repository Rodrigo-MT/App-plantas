import { PartialType } from '@nestjs/mapped-types';
import { CreateCareReminderDto, CareReminderType } from './create-care-reminder.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';
import { IsNotFutureDate, IsStrictFutureDate } from '../../common/validators/date.validators';

export class UpdateCareReminderDto extends PartialType(CreateCareReminderDto) {
  @ApiPropertyOptional({ description: 'Nome da planta associada', example: 'Rosa do Deserto' })
  @IsOptional()
  @IsString({ message: 'O nome da planta deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da planta não pode ser vazio.' })
  plantName?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de cuidado',
    example: 'fertilizing',
    enum: Object.values(CareReminderType)
  })
  @IsOptional()
  type?: CareReminderType;

  @ApiPropertyOptional({ description: 'Frequência em dias', example: 14 })
  @IsOptional()
  @IsInt({ message: 'A frequência deve ser um número inteiro.' })
  @Min(1, { message: 'A frequência mínima é 1 dia.' })
  @Max(99, { message: 'A frequência máxima é 99 dias.' })
  frequency?: number;

  @ApiPropertyOptional({ description: 'Data da última execução', example: '2024-01-15' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A última realização não pode ser futura; use hoje ou uma data passada.' })
  lastDone?: string;

  @ApiPropertyOptional({ description: 'Próxima data de vencimento', example: '2024-01-25' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsStrictFutureDate({ message: 'A próxima data deve ser futura (maior que hoje).' })
  nextDue?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Nova observação' })
  @IsOptional()
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações não pode ser vazio.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o lembrete está ativo', example: false })
  isActive?: boolean;
}