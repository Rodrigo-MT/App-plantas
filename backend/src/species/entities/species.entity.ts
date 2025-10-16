import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class Species {
  @ApiProperty({ description: 'ID único da espécie (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome popular da espécie', example: 'Rosa do Deserto' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Nome científico da espécie', example: 'Adenium obesum' })
  @Column()
  scientificName: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Planta suculenta originária da África' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Frequência de rega recomendada',
    example: 'weekly',
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  })
  @Column()
  waterFrequency: string;

  @ApiProperty({ 
    description: 'Requisitos de luz solar',
    example: 'high', 
    enum: ['low', 'medium', 'high']
  })
  @Column()
  lightRequirements: string;

  @ApiPropertyOptional({ description: 'Instruções específicas de cuidado', example: 'Evitar excesso de água no inverno' })
  @Column({ type: 'text', nullable: true })
  careInstructions: string;

  @ApiProperty({ type: () => [Plant], description: 'Plantas desta espécie' })
  @OneToMany(() => Plant, (plant) => plant.species)
  plants: Plant[];
}