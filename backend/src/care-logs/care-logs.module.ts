import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareLogsService } from './care-logs.service';
import { CareLogsController } from './care-logs.controller';
import { CareLog } from './entities/care-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareLog])],
  controllers: [CareLogsController],
  providers: [CareLogsService],
  exports: [CareLogsService],
})
export class CareLogsModule {}