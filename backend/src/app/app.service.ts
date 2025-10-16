import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retorna mensagem de status da API
   * @returns Mensagem de confirmação que a API está rodando
   */
  getHello(): string {
    return '🌱 Plant Care API is running!';
  }

  /**
   * Retorna informações de health check da aplicação
   * @returns Objeto com status e timestamp
   */
  getHealthCheck(): { status: string; timestamp: string; service: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Plant Care API',
    };
  }
}