import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlantDto {
  @ApiProperty({ 
    description: 'Nome da planta', 
    example: 'Rosa do Deserto',
    maxLength: 100
  })
  @IsString()
  name: string;

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

  @ApiProperty({ 
    description: 'Data de compra/plantio (formato ISO: YYYY-MM-DD)',
    example: '2024-01-15'
  })
  @IsDateString()
  purchaseDate: string;

  @ApiPropertyOptional({ 
    description: 'Observações sobre a planta', 
    example: 'Planta que precisa de sol direto',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'URL da foto da planta', 
    example: 'https://exemplo.com/planta.jpg' 
  })
  @IsOptional()
  @IsString()
  photo?: string;
}