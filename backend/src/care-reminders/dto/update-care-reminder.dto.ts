import { PartialType } from '@nestjs/mapped-types';
import { CreateCareReminderDto } from './create-care-reminder.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCareReminderDto extends PartialType(CreateCareReminderDto) {
  @ApiPropertyOptional({ description: 'ID da planta associada' })
  plantId?: string;

  @ApiPropertyOptional({ description: 'Tipo de cuidado' })
  type?: string;

  @ApiPropertyOptional({ description: 'Frequência em dias (1 a 99)' })
  frequency?: number;

  @ApiPropertyOptional({ description: 'Data da última execução' })
  lastDone?: string;

  @ApiPropertyOptional({ description: 'Próxima data de vencimento' })
  nextDue?: string;

  @ApiPropertyOptional({ description: 'Observações (máx. 500 caracteres)' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o lembrete está ativo' })
  isActive?: boolean;
}
