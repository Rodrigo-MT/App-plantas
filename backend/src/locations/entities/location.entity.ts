import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
    enum: ['indoor', 'outdoor', 'balcony', 'garden', 'terrace']
  })
  @Column()
  type: string;

  @ApiProperty({ 
    description: 'Nível de luz solar',
    example: 'partial',
    enum: ['full', 'partial', 'shade']
  })
  @Column()
  sunlight: string;

  @ApiProperty({ 
    description: 'Nível de umidade',
    example: 'medium',
    enum: ['low', 'medium', 'high']
  })
  @Column()
  humidity: string;

  @ApiPropertyOptional({ description: 'Descrição da localização', example: 'Ambiente interno com luz indireta' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ description: 'URL da foto da localização', example: 'https://exemplo.com/localizacao.jpg' })
  @Column({ nullable: true })
  photo?: string;

  @ApiProperty({ type: () => [Plant], description: 'Plantas nesta localização' })
  @OneToMany(() => Plant, (plant) => plant.location)
  plants: Plant[];

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;
}