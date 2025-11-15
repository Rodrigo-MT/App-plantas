import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCareReminderDto } from './create-care-reminder.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';
import { IsNotFutureDate } from '../../common/validators/date.validators';

// Update NÃO permite alterar plantName, type ou nextDue (fazem parte do identificador composto)
class BaseUpdatableCareReminderDto extends OmitType(CreateCareReminderDto, [
  'plantName',
  'type',
  'nextDue',
] as const) {}

export class UpdateCareReminderDto extends PartialType(BaseUpdatableCareReminderDto) {
  @ApiPropertyOptional({ description: 'Frequência em dias', example: 10 })
  @IsOptional()
  @IsInt({ message: 'A frequência deve ser um número inteiro.' })
  @Min(1, { message: 'A frequência mínima é 1 dia.' })
  @Max(99, { message: 'A frequência máxima é 99 dias.' })
  frequency?: number;

  // Exemplo: última execução HOJE
  @ApiPropertyOptional({ description: 'Data da última execução', example: '2025-11-15' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A última realização não pode ser futura; use hoje ou uma data passada.' })
  lastDone?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Aumentar volume de água na próxima vez' })
  @IsOptional()
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações não pode ser vazio.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o lembrete está ativo', example: false })
  isActive?: boolean;
}