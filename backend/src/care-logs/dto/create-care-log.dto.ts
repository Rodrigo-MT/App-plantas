import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareLogDto {
  @ApiProperty({ 
    description: 'Tipo de cuidado realizado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @IsEnum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other'])
  type: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Planta estava com folhas amarelas' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica se o cuidado foi realizado com sucesso', example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  plantId: string;
}