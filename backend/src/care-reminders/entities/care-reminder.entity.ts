import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class CareReminder {
  @ApiProperty({ description: 'ID único do lembrete (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column()
  plantId: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @Column()
  type: string;

  @ApiProperty({ description: 'Frequência em dias', example: 7 })
  @Column()
  frequency: number;

  @ApiProperty({ description: 'Data da última execução', example: '2024-01-10' })
  @Column({ type: 'date' })
  lastDone: Date;

  @ApiProperty({ description: 'Próxima data de vencimento', example: '2024-01-20' })
  @Column({ type: 'date' })
  nextDue: Date;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Usar água filtrada' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Indica se o lembrete está ativo', example: true })
  @Column({ default: true })
  isActive: boolean;

  // Relação com a planta
  @ApiProperty({ type: () => Plant, description: 'Planta associada ao lembrete' })
  @ManyToOne(() => Plant, (plant) => plant.reminders)
  plant: Plant;

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;
}