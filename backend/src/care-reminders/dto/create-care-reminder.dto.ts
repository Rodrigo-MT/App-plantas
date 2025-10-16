import { IsString, IsDateString, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareReminderDto {
  @ApiProperty({ 
    description: 'Tipo de cuidado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @IsEnum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other'])
  type: string;

  @ApiProperty({ description: 'Descrição do lembrete', example: 'Regar a planta com 500ml de água' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Próxima data de vencimento (YYYY-MM-DD)', example: '2024-01-20' })
  @IsDateString()
  nextDue: string;

  @ApiProperty({ 
    description: 'Frequência do cuidado',
    example: 'weekly',
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  })
  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly'])
  frequency: string;

  @ApiProperty({ description: 'Indica se o lembrete está ativo', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  plantId: string;
}