import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareRemindersService } from './care-reminders.service';
import { CareRemindersController } from './care-reminders.controller';
import { CareReminder } from './entities/care-reminder.entity';
import { PlantsModule } from '../plants/plants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareReminder]),
    forwardRef(() => PlantsModule),
  ],
  controllers: [CareRemindersController],
  providers: [CareRemindersService],
  exports: [CareRemindersService],
})
export class CareRemindersModule {}