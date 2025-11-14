import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { parseYMDToLocalDate } from '../utils/date.utils';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value) return false;
          const d = parseYMDToLocalDate(value);
          if (!d) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          d.setHours(0, 0, 0, 0);
          return d.getTime() <= today.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser hoje ou uma data passada`; // friendly default
        },
      },
    });
  };
}

export function IsStrictFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrictFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value) return false;
          const d = parseYMDToLocalDate(value);
          if (!d) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          d.setHours(0, 0, 0, 0);
          return d.getTime() > today.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser uma data futura (maior que hoje)`;
        },
      },
    });
  };
}
