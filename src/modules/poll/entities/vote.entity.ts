import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { PollOption } from './poll-option.entity';

@Entity()
@Unique(['userId', 'option'])
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; 

  @ManyToOne(() => PollOption, (option) => option.votes, {
    onDelete: 'CASCADE',
  })
  option: PollOption;
}
