import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importação dos módulos de funcionalidade
import { PlantsModule } from '../plants/plants.module';
import { SpeciesModule } from '../species/species.module';
import { LocationsModule } from '../locations/locations.module';
import { CareRemindersModule } from '../care-reminders/care-reminders.module';
import { CareLogsModule } from '../care-logs/care-logs.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuração do TypeORM com PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432'), 10),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'plantcare_db'),
        
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        
        // Sincronização controlada por variável de ambiente DB_SYNCHRONIZE (espera 'true'/'false')
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',

        // Logging controlado por variável DB_LOGGING (espera 'true'/'false')
        logging: configService.get('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),

    // Módulos de funcionalidade da aplicação
    PlantsModule,
    SpeciesModule,
    LocationsModule,
    CareRemindersModule,
    CareLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}