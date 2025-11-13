import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsUUID, 
  MaxLength, 
  Matches 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlantDto {
  @ApiProperty({ 
    description: 'Nome da planta (apenas letras e espaços)', 
    example: 'Rosa do Deserto',
    maxLength: 100
  })
  @IsString({ message: 'O nome da planta deve ser uma string.' })
  @MaxLength(100, { message: 'O nome da planta deve ter no máximo 100 caracteres.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
    message: 'O nome da planta não pode conter números ou caracteres especiais.',
  })
  name: string;

  @ApiProperty({ 
    description: 'ID da espécie da planta (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(undefined, { message: 'Espécie é obrigatória e deve ser um UUID válido.' })
  speciesId: string;

  @ApiProperty({ 
    description: 'ID da localização da planta (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(undefined, { message: 'Local é obrigatório e deve ser um UUID válido.' })
  locationId: string;

  @ApiProperty({ 
    description: 'Data de compra/plantio (formato ISO: YYYY-MM-DD)',
    example: '2024-01-15'
  })
  @IsDateString({}, { message: 'A data de compra deve estar em formato válido (YYYY-MM-DD).' })
  purchaseDate: string;

  @ApiProperty({ 
    description: 'Observações sobre a planta (máx. 500 caracteres)', 
    example: 'Planta que precisa de sol direto',
    maxLength: 500
  })
  @IsString({ message: 'Observações devem ser texto.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes: string;

  @ApiPropertyOptional({ 
    description: 'Imagem da planta em formato compatível (ex: data:image/jpeg;base64,...)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...'
  })
  @IsOptional()
  @IsString({ message: 'A imagem deve ser em formato compatível' })
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, {
    message: 'A imagem deve estar em formato Base64 válido (data:image/...;base64,)',
  })
  photo?: string;
}
