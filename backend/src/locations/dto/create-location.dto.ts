import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'Nome da localização', example: 'Sala de Estar' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Tipo de ambiente',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'balcony', 'garden', 'terrace']
  })
  @IsEnum(['indoor', 'outdoor', 'balcony', 'garden', 'terrace'])
  type: string;

  @ApiProperty({ 
    description: 'Nível de luz solar',
    example: 'partial',
    enum: ['full', 'partial', 'shade']
  })
  @IsEnum(['full', 'partial', 'shade'])
  sunlight: string;

  @ApiProperty({ 
    description: 'Nível de umidade',
    example: 'medium',
    enum: ['low', 'medium', 'high']
  })
  @IsEnum(['low', 'medium', 'high'])
  humidity: string;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Ambiente interno com luz indireta' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL da foto da localização', example: 'https://exemplo.com/localizacao.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;
}