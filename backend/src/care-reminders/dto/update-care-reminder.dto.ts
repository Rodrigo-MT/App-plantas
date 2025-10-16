import { PartialType } from '@nestjs/mapped-types';
import { CreateCareReminderDto } from './create-care-reminder.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCareReminderDto extends PartialType(CreateCareReminderDto) {
  @ApiPropertyOptional({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  plantId?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de cuidado',
    example: 'fertilizing',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  type?: string;

  @ApiPropertyOptional({ description: 'Frequência em dias', example: 14 })
  frequency?: number;

  @ApiPropertyOptional({ description: 'Data da última execução', example: '2024-01-15' })
  lastDone?: string;

  @ApiPropertyOptional({ description: 'Próxima data de vencimento', example: '2024-01-25' })
  nextDue?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Nova observação' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o lembrete está ativo', example: false })
  isActive?: boolean;
}