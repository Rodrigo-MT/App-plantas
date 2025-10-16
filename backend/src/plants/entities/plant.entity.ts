import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Species } from '../../species/entities/species.entity';
import { Location } from '../../locations/entities/location.entity';
import { CareReminder } from '../../care-reminders/entities/care-reminder.entity';
import { CareLog } from '../../care-logs/entities/care-log.entity';

@Entity()
export class Plant {
  @ApiProperty({ description: 'ID único da planta (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome da planta', example: 'Rosa do Deserto' })
  @Column()
  name: string;

  @ApiPropertyOptional({ description: 'URL da imagem da planta', example: 'https://exemplo.com/planta.jpg' })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Observações sobre a planta', example: 'Planta que precisa de sol direto' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ 
    description: 'Status de saúde da planta', 
    example: 'healthy',
    enum: ['healthy', 'needs_care', 'sick']
  })
  @Column({ default: 'healthy' })
  healthStatus: string;

  @ApiProperty({ description: 'Data de plantio', example: '2024-01-15' })
  @Column({ type: 'date' })
  plantingDate: Date;

  // Relações
  @ApiProperty({ type: () => Species, description: 'Espécie da planta' })
  @ManyToOne(() => Species, (species) => species.plants)
  species: Species;

  @ApiProperty({ type: () => Location, description: 'Localização da planta' })
  @ManyToOne(() => Location, (location) => location.plants)
  location: Location;

  @ApiProperty({ type: () => [CareReminder], description: 'Lembretes de cuidado da planta' })
  @OneToMany(() => CareReminder, (reminder) => reminder.plant)
  reminders: CareReminder[];

  @ApiProperty({ type: () => [CareLog], description: 'Histórico de cuidados da planta' })
  @OneToMany(() => CareLog, (careLog) => careLog.plant)
  careLogs: CareLog[];

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  @UpdateDateColumn()
  updatedAt: Date;
}