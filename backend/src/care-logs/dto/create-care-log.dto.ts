import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareLogDto {
  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  plantId: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado realizado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other']
  })
  @IsEnum(['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other'])
  type: string;

  @ApiProperty({ description: 'Data em que o cuidado foi realizado (YYYY-MM-DD)', example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Planta estava com folhas amarelas' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'URL da foto do cuidado realizado', example: 'https://exemplo.com/care-log.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: 'Indica se o cuidado foi realizado com sucesso', example: true })
  @IsBoolean()
  success: boolean;
}