import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class CareLog {
  @ApiProperty({ description: 'ID único do log (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID da planta associada', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Column()
  plantId: string;

  @ApiProperty({ 
    description: 'Tipo de cuidado realizado',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other']
  })
  @Column()
  type: string;

  @ApiProperty({ description: 'Data em que o cuidado foi realizado', example: '2024-01-15' })
  @Column({ type: 'date' })
  date: Date;

  @ApiPropertyOptional({ description: 'Observações sobre o cuidado realizado', example: 'Planta estava com folhas amarelas' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'URL da foto do cuidado realizado', example: 'https://exemplo.com/care-log.jpg' })
  @Column({ nullable: true })
  photo?: string;

  @ApiProperty({ description: 'Indica se o cuidado foi realizado com sucesso', example: true })
  @Column({ default: true })
  success: boolean;

  // Relação com a planta
  @ApiProperty({ type: () => Plant, description: 'Planta associada ao log' })
  @ManyToOne(() => Plant, (plant) => plant.careLogs)
  plant: Plant;

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;
}