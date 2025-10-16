import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'Nome da localização', example: 'Sala de Estar' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Tipo de ambiente',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'greenhouse']
  })
  @IsEnum(['indoor', 'outdoor', 'greenhouse'])
  type: string;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Prateleira perto da janela' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Nível de luz no local',
    example: 'high',
    enum: ['low', 'medium', 'high']
  })
  @IsEnum(['low', 'medium', 'high'])
  lightLevel: string;

  @ApiProperty({ 
    description: 'Nível de umidade no local',
    example: 'medium',
    enum: ['low', 'medium', 'high']
  })
  @IsEnum(['low', 'medium', 'high'])
  humidity: string;
}