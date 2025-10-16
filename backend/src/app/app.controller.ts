import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Status da API',
    description: 'Endpoint de health check para verificar se a API está funcionando' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API está funcionando corretamente',
    schema: {
      example: 'Plant Care API is running!'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Health Check detalhado',
    description: 'Retorna informações detalhadas sobre o status da API' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status de saúde da API',
    schema: {
      example: { status: 'OK', timestamp: '2024-01-15T10:30:00.000Z' }
    }
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}