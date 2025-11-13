import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantDto } from './create-plant.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  MaxLength, 
  Matches 
} from 'class-validator';

export class UpdatePlantDto extends PartialType(CreatePlantDto) {
  @ApiPropertyOptional({ 
    description: 'Nome da planta (apenas letras e espaços)', 
    example: 'Orquídea Branca'
  })
  @IsOptional()
  @IsString({ message: 'O nome da planta deve ser uma string.' })
  @MaxLength(100, { message: 'O nome da planta deve ter no máximo 100 caracteres.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { 
    message: 'O nome da planta não pode conter números ou caracteres especiais.' 
  })
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Observações sobre a planta (máx. 500 caracteres)', 
    example: 'Agora está em vaso maior e com mais luz natural.',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser texto.' })
  @MaxLength(500, { message: 'O campo observações deve ter no máximo 500 caracteres.' })
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Imagem da planta em formato compatível (ex: data:image/jpeg;base64,...)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'
  })
  @IsOptional()
  @IsString({ message: 'A imagem deve ser em formato compatível' })
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, {
    message: 'A imagem deve estar em formato Base64 válido (data:image/...;base64,)',
  })
  photo?: string;
}
