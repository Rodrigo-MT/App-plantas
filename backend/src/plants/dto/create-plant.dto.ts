import { IsString, IsOptional, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlantDto {
  @ApiProperty({ 
    description: 'Nome da planta', 
    example: 'Rosa do Deserto',
    maxLength: 100
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    description: 'URL da imagem da planta', 
    example: 'https://exemplo.com/planta.jpg' 
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Observações sobre a planta', 
    example: 'Planta que precisa de sol direto',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'Status de saúde da planta',
    example: 'healthy',
    enum: ['healthy', 'needs_care', 'sick']
  })
  @IsEnum(['healthy', 'needs_care', 'sick'])
  healthStatus: string;

  @ApiProperty({ 
    description: 'Data de plantio (formato ISO: YYYY-MM-DD)',
    example: '2024-01-15'
  })
  @IsDateString()
  plantingDate: string;

  @ApiProperty({ 
    description: 'ID da espécie da planta (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  speciesId: string;

  @ApiProperty({ 
    description: 'ID da localização da planta (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  locationId: string;
}