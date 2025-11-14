import { IsString, IsOptional, IsDateString, IsBoolean, IsEnum, IsInt, Min, Max, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotFutureDate, IsStrictFutureDate } from '../../common/validators/date.validators';

export enum CareReminderType {
  WATERING = 'watering',
  FERTILIZING = 'fertilizing',
  PRUNING = 'pruning',
  SUNLIGHT = 'sunlight',
  OTHER = 'other',
}

export class CreateCareReminderDto {
  @ApiProperty({ description: 'Nome da planta associada', example: 'Rosa do Deserto' })
  @IsString({ message: 'O nome da planta deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da planta é obrigatório.' })
  plantName: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado',
    example: 'watering',
    enum: Object.values(CareReminderType)
  })
  @IsEnum(CareReminderType)
  type: CareReminderType;

  @ApiProperty({ description: 'Frequência em dias', example: 7 })
  @IsInt({ message: 'A frequência deve ser um número inteiro.' })
  @Min(1, { message: 'A frequência mínima é 1 dia.' })
  @Max(99, { message: 'A frequência máxima é 99 dias.' })
  frequency: number;

  @ApiProperty({ description: 'Data da última execução (YYYY-MM-DD)', example: '2024-01-10' })
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A última realização não pode ser futura; use hoje ou uma data passada.' })
  lastDone: string;

  @ApiProperty({ description: 'Próxima data de vencimento (YYYY-MM-DD)', example: '2024-01-20' })
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsStrictFutureDate({ message: 'A próxima data deve ser futura (maior que hoje).' })
  nextDue: string;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Usar água filtrada' })
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações é obrigatório.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiProperty({ description: 'Indica se o lembrete está ativo', example: true })
  @IsBoolean()
  isActive: boolean;
}