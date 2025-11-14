import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { Plant } from './entities/plant.entity';
import { SpeciesModule } from '../species/species.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plant]), SpeciesModule, LocationsModule],
  controllers: [PlantsController],
  providers: [PlantsService],
  exports: [PlantsService, TypeOrmModule], // ✅ exporta TypeOrmModule
})
export class PlantsModule {}
