import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsBoolean, 
  IsUUID, 
  IsEnum, 
  IsInt, 
  Min, 
  Max, 
  MaxLength, 
  Validate, 
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

// --------- CUSTOM VALIDATORS ---------
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
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date <= today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser uma data de hoje ou anterior.`;
        },
      },
    });
  };
}

function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date > today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser uma data futura (não pode ser hoje ou anterior).`;
        },
      },
    });
  };
}

// --------- DTO ---------
export class CreateCareReminderDto {
  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  plantId: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @IsEnum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other'])
  type: string;

  @ApiProperty({ description: 'Frequência em dias (1 a 99)', example: 7 })
  @IsInt()
  @Min(1)
  @Max(99)
  frequency: number;

  @ApiProperty({ description: 'Data da última execução (YYYY-MM-DD)', example: '2024-01-10' })
  @IsDateString()
  @IsPastOrToday({ message: 'A data da última realização deve ser hoje ou anterior.' })
  lastDone: string;

  @ApiProperty({ description: 'Próxima data de vencimento (YYYY-MM-DD)', example: '2024-01-20' })
  @IsDateString()
  @IsFutureDate({ message: 'A próxima data deve ser futura (não pode ser hoje ou anterior).' })
  nextDue: string;

  @ApiProperty({ description: 'Observações (máx. 500 caracteres)', example: 'Usar água filtrada' })
  @IsString()
  @MaxLength(500)
  notes: string;

  @ApiProperty({ description: 'Indica se o lembrete está ativo', example: true })
  @IsBoolean()
  isActive: boolean;
}
