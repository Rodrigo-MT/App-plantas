import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilita validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do CORS usando variáveis de ambiente
  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3001').split(',');
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Configuração da documentação Swagger (fixa)
  const config = new DocumentBuilder()
    .setTitle('🌱 Plant Care API')
    .setDescription('API completa para gerenciamento de plantas domésticas')
    .setVersion('1.0')
    .addTag('plants', 'Operações relacionadas a plantas')
    .addTag('species', 'Operações relacionadas a espécies de plantas')
    .addTag('locations', 'Operações relacionadas a localizações')
    .addTag('care-reminders', 'Operações relacionadas a lembretes de cuidados')
    .addTag('care-logs', 'Operações relacionadas a logs de cuidados realizados')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Plant Care API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação disponível em: http://localhost:${port}/api`);
  console.log(`🌍 Ambiente: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap();