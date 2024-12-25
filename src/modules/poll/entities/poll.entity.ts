import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PollOption } from './poll-option.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Poll {
  @ApiProperty({ description: 'Unique identifier of the poll', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The question of the poll',
    example: 'What is your favorite programming language?',
  })
  @Column()
  question: string;

  @ApiProperty({
    description: 'List of options for the poll',
    type: () => [PollOption],
    example: [
      { id: 1, text: 'JavaScript' },
      { id: 2, text: 'Python' },
    ],
  })
  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options: PollOption[];
}
