import { IsString, IsOptional, IsDateString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotFutureDate } from '../../common/validators/date.validators';

export class CreatePlantDto {
  @ApiProperty({ 
    description: 'Nome da planta', 
    example: 'Rosa do Deserto',
    maxLength: 100
  })
  @IsString({ message: 'O nome da planta deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome de planta é obrigatório.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome da planta não pode conter números nem caracteres especiais.' })
  name: string;

  @ApiProperty({ 
    description: 'Nome científico da espécie da planta',
    example: 'Monstera deliciosa'
  })
  @IsString()
  @IsNotEmpty({ message: 'A espécie (scientific name) é obrigatória.' })
  speciesName: string;

  @ApiProperty({ 
    description: 'Nome da localização onde a planta está (ex: Sala de Estar)',
    example: 'Sala de Estar'
  })
  @IsString()
  @IsNotEmpty({ message: 'A localização é obrigatória.' })
  locationName: string;

  @ApiProperty({ 
    description: 'Data de compra/plantio (formato ISO: YYYY-MM-DD)',
    example: '2024-01-15'
  })
  @IsDateString({}, { message: 'Data de compra inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A data de compra não pode ser futura; deve ser hoje ou uma data passada.' })
  purchaseDate: string;

  @ApiPropertyOptional({ 
    description: 'Observações sobre a planta', 
    example: 'Planta que precisa de sol direto',
    maxLength: 500
  })
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações é obrigatório.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'URL da foto da planta', 
    example: 'https://exemplo.com/planta.jpg' 
  })
  @IsOptional()
  @IsString()
  photo?: string;
}