import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class CareLog {
  @ApiProperty({ description: 'ID único do log (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado realizado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'sunlight', 'other']
  })
  @Column()
  type: string;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Planta estava com folhas amarelas' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Indica se o cuidado foi realizado com sucesso', example: true })
  @Column({ default: true })
  success: boolean;

  @ApiProperty({ description: 'Data e hora em que o cuidado foi realizado' })
  @CreateDateColumn()
  performedAt: Date;

  @ApiProperty({ type: () => Plant, description: 'Planta associada ao log' })
  @ManyToOne(() => Plant, (plant) => plant.careLogs)
  plant: Plant;
}