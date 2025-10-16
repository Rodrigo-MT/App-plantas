import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas nos DTOs
    forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
    transform: true, // Transforma tipos automaticamente
  }));

  // Configuração do CORS para o frontend React Native
  app.enableCors({
    origin: ['http://localhost:3001', 'exp://localhost:19000'], // URLs do frontend
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Configuração da documentação Swagger
  const config = new DocumentBuilder()
    .setTitle('🌱 Plant Care API')
    .setDescription('API completa para gerenciamento de plantas domésticas. Fornece CRUDs para plantas, espécies, localizações, lembretes e logs de cuidados.')
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação disponível em: http://localhost:${port}/api`);
}
bootstrap();