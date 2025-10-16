import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class Location {
  @ApiProperty({ description: 'ID único da localização (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome da localização', example: 'Sala de Estar' })
  @Column()
  name: string;

  @ApiProperty({ 
    description: 'Tipo de ambiente',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'greenhouse']
  })
  @Column()
  type: string;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Prateleira perto da janela' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Nível de luz no local',
    example: 'high',
    enum: ['low', 'medium', 'high']
  })
  @Column({ default: 'medium' })
  lightLevel: string;

  @ApiProperty({ 
    description: 'Nível de umidade no local',
    example: 'medium', 
    enum: ['low', 'medium', 'high']
  })
  @Column({ default: 'medium' })
  humidity: string;

  @ApiProperty({ type: () => [Plant], description: 'Plantas nesta localização' })
  @OneToMany(() => Plant, (plant) => plant.location)
  plants: Plant[];
}