import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareRemindersService } from './care-reminders.service';
import { CareRemindersController } from './care-reminders.controller';
import { CareReminder } from './entities/care-reminder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareReminder])],
  controllers: [CareRemindersController],
  providers: [CareRemindersService],
  exports: [CareRemindersService],
})
export class CareRemindersModule {}