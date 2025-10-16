import { IsString, IsOptional, IsDateString, IsBoolean, IsUUID, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareReminderDto {
  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  plantId: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @IsEnum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other'])
  type: string;

  @ApiProperty({ description: 'Frequência em dias', example: 7 })
  @IsNumber()
  frequency: number;

  @ApiProperty({ description: 'Data da última execução (YYYY-MM-DD)', example: '2024-01-10' })
  @IsDateString()
  lastDone: string;

  @ApiProperty({ description: 'Próxima data de vencimento (YYYY-MM-DD)', example: '2024-01-20' })
  @IsDateString()
  nextDue: string;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Usar água filtrada' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica se o lembrete está ativo', example: true })
  @IsBoolean()
  isActive: boolean;
}