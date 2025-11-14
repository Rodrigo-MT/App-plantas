import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantDto } from './create-plant.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { IsNotFutureDate } from '../../common/validators/date.validators';

export class UpdatePlantDto extends PartialType(CreatePlantDto) {
  @ApiPropertyOptional({ description: 'Nome da planta', example: 'Novo Nome da Planta' })
  @IsOptional()
  @IsString({ message: 'O nome da planta deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da planta não pode ser vazio.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome da planta não pode conter números nem caracteres especiais.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Nome científico da espécie', example: 'Monstera deliciosa' })
  @IsOptional()
  @IsString()
  speciesName?: string;

  @ApiPropertyOptional({ description: 'Nome da localização', example: 'Sala de Estar' })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({ description: 'Data de compra/plantio', example: '2024-02-20' })
  @IsOptional()
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD.' })
  @IsNotFutureDate({ message: 'A data de compra não pode ser futura; deve ser hoje ou passada.' })
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Observações sobre a planta', example: 'Nova observação' })
  @IsOptional()
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações não pode ser vazio.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ description: 'URL da foto da planta', example: 'https://exemplo.com/nova-foto.jpg' })
  photo?: string;
}