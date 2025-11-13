import { PartialType } from '@nestjs/mapped-types';
import { CreateCareLogDto } from './create-care-log.dto';

export class UpdateCareLogDto extends PartialType(CreateCareLogDto) {}
