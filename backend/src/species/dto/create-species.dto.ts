import { 
  IsString, 
  IsOptional, 
  IsNotEmpty, 
  MaxLength, 
  Matches 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeciesDto {
  @ApiProperty({ description: 'Nome científico da espécie', example: 'Monstera deliciosa' })
  @IsString({ message: 'O nome científico deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome científico é obrigatório.' })
  @MaxLength(100, { message: 'O nome científico deve ter no máximo 100 caracteres.' })
  @Matches(/^[^\d]+$/, { message: 'O nome científico não pode conter números.' })
  name: string;

  @ApiProperty({ description: 'Nome comum/popular da espécie', example: 'Costela de Adão' })
  @IsString({ message: 'O nome comum deve ser um texto.' })
  @MaxLength(100, { message: 'O nome comum deve ter no máximo 100 caracteres.' })
  @IsNotEmpty({ message: 'O nome comum é obrigatório.' })
  @Matches(/^[^\d]+$/, { message: 'O nome comum não pode conter números.' })
  commonName: string;

  @ApiProperty({ description: 'Descrição detalhada da espécie', example: 'Planta tropical com folhas grandes e recortadas.' })
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
  description: string;

  @ApiProperty({ description: 'Instruções de cuidado', example: 'Luz indireta, rega moderada.' })
  @IsString({ message: 'As instruções de cuidado devem ser um texto.' })
  @IsNotEmpty({ message: 'As instruções de cuidado são obrigatórias.' })
  @MaxLength(500, { message: 'As instruções de cuidado devem ter no máximo 500 caracteres.' })
  careInstructions: string;

  @ApiProperty({ description: 'Condições ideais de cultivo', example: 'Sol parcial, umidade média.' })
  @IsString({ message: 'As condições ideais devem ser um texto.' })
  @IsNotEmpty({ message: 'As condições ideais são obrigatórias.' })
  @MaxLength(500, { message: 'As condições ideais devem ter no máximo 500 caracteres.' })
  idealConditions: string;

@ApiPropertyOptional({ 
  description: 'Imagem da espécie em formato Base64 (ex: data:image/jpeg;base64,...)',
  example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
})
@IsOptional()
@IsString({ message: 'A imagem deve ser um texto Base64 válido.' })
@Matches(/^data:image\/(jpeg|png|webp);base64,/, {
  message: 'A imagem deve estar em formato Base64 válido (data:image/...;base64,)',
})
photo?: string;

}
