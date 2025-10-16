import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class CareReminder {
  @ApiProperty({ description: 'ID único do lembrete (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @Column()
  type: string;

  @ApiProperty({ description: 'Descrição do lembrete', example: 'Regar a planta com 500ml de água' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Próxima data de vencimento', example: '2024-01-20' })
  @Column({ type: 'date' })
  nextDue: Date;

  @ApiProperty({ 
    description: 'Frequência do cuidado',
    example: 'weekly',
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  })
  @Column({ default: 'daily' })
  frequency: string;

  @ApiProperty({ description: 'Indica se o lembrete está ativo', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ type: () => Plant, description: 'Planta associada ao lembrete' })
  @ManyToOne(() => Plant, (plant) => plant.reminders)
  plant: Plant;
}