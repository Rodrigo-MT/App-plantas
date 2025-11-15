import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCareLogDto } from './create-care-log.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';

// Update NÃO permite alterar plantName, type ou date (identificador composto)
class BaseUpdatableCareLogDto extends OmitType(CreateCareLogDto, [
  'plantName',
  'type',
  'date',
] as const) {}

export class UpdateCareLogDto extends PartialType(BaseUpdatableCareLogDto) {

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Podou 2 folhas danificadas' })
  @IsOptional()
  @IsString({ message: 'Observações deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo observações não pode ser vazio.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Indica se o cuidado foi realizado com sucesso', example: false })
  @IsOptional()
  @IsBoolean()
  success?: boolean;
}