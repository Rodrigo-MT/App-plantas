import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilita CORS de forma segura
  if (process.env.NODE_ENV === 'development') {
    // Permite qualquer origem em dev (Web + IPs locais)
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    });
  } else {
    // Produção: apenas origens definidas no .env
    const corsOrigins = configService.get('CORS_ORIGINS', '').split(',');
    app.enableCors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    });
  }

  // Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('🌱 Plant Care API')
    .setDescription('API completa para gerenciamento de plantas domésticas')
    .setVersion('1.0')
    .addTag('plants')
    .addTag('species')
    .addTag('locations')
    .addTag('care-reminders')
    .addTag('care-logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Plant Care API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API rodando em: http://localhost:${port}`);
}

bootstrap();
