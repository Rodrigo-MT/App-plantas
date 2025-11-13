// src/care-logs/dto/create-care-log.dto.ts
import {
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsDateString,
  MaxLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// --------- CUSTOM VALIDATOR: permite hoje ou data passada ---------
function IsPastOrToday(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPastOrToday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          // permite hoje ou passado
          return date <= today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser hoje ou uma data passada.`;
        },
      },
    });
  };
}

// --------- DTO ---------
export class CreateCareLogDto {
  @ApiProperty({
    description: 'ID da planta associada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'O ID da planta deve ser um UUID válido.' })
  plantId: string;

  @ApiProperty({
    description: 'Tipo de cuidado realizado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other'],
  })
  @IsEnum(['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other'], {
    message: 'Tipo de cuidado inválido.',
  })
  type: string;

  @ApiProperty({
    description: 'Data em que o cuidado foi realizado (YYYY-MM-DD). Pode ser hoje ou data passada.',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'A data deve estar em formato válido (YYYY-MM-DD).' })
  @IsPastOrToday({ message: 'A data do cuidado deve ser hoje ou anterior.' })
  date: string;

  @ApiProperty({
    description: 'Observações sobre o cuidado realizado (máx. 500 caracteres)',
    example: 'Planta estava com folhas amarelas',
  })
  @IsString({ message: 'Observações devem ser texto.' })
  @MaxLength(500, { message: 'As observações devem ter no máximo 500 caracteres.' })
  notes: string;

  @ApiProperty({
    description: 'Indica se o cuidado foi realizado com sucesso',
    example: true,
  })
  @IsBoolean({ message: 'O campo success deve ser booleano.' })
  success: boolean;
}
