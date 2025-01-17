import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Poll } from './poll.entity';
import { Vote } from './vote.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['text', 'poll'])
export class PollOption {
  @ApiProperty({
    description: 'Unique identifier of the poll option',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The text of the poll option',
    example: 'JavaScript',
  })
  @Column()
  text: string;

  @ApiProperty({
    description: 'counter of this option',
    example: '0',
  })
  @Column({ default: 0 })
  count: number;

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: 'CASCADE' })
  poll: Poll;

  @OneToMany(() => Vote, (vote) => vote.option)
  votes: Vote[];
}
