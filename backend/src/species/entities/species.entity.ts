import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plant } from '../../plants/entities/plant.entity';

@Entity()
export class Species {
  @ApiProperty({ description: 'ID único da espécie (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome científico da espécie', example: 'Monstera deliciosa' })
  @Column()
  name: string;

  @ApiPropertyOptional({ description: 'Nome comum/popular da espécie', example: 'Costela de Adão' })
  @Column({ nullable: true })
  commonName?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da espécie', example: 'Planta tropical com folhas grandes e recortadas.' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ description: 'Instruções de cuidado', example: 'Luz indireta, rega moderada.' })
  @Column({ type: 'text', nullable: true })
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Condições ideais de cultivo', example: 'Sol parcial, umidade média.' })
  @Column({ type: 'text', nullable: true })
  idealConditions?: string;

  @ApiPropertyOptional({ description: 'Imagem da foto da espécie', example: 'https://exemplo.com/especie.jpg' })
  @Column({ type: 'text', nullable: true })
  photo?: string | null;

  @ApiProperty({ type: () => [Plant], description: 'Plantas desta espécie' })
  @OneToMany(() => Plant, (plant) => plant.species)
  plants: Plant[];

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;
}