import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({ description: 'Nome da localização', example: 'Varanda Gourmet' })
  name?: string;

  @ApiPropertyOptional({ description: 'Tipo de ambiente (indoor, outdoor, balcony, garden, terrace)' })
  type?: CreateLocationDto['type'];

  @ApiPropertyOptional({ description: 'Nível de luz solar (full, partial, shade)' })
  sunlight?: CreateLocationDto['sunlight'];

  @ApiPropertyOptional({ description: 'Nível de umidade (low, medium, high)' })
  humidity?: CreateLocationDto['humidity'];

  @ApiPropertyOptional({ description: 'Descrição da localização' })
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Imagem do local em formato compativel (ex: data:image/jpeg;base64,...)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'
  })
  @IsOptional()
  @IsString({ message: 'A imagem deve ser em formato compativel.' })
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, {
    message: 'A imagem deve estar em formato Base64 válido (data:image/...;base64,)',
  })
  photo?: string;
}
