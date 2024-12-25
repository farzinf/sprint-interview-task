import { IsString, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePollDto {
  @ApiProperty({
    description: 'The question of the poll',
    example: 'What is your favorite programming language?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'List of options for the poll',
    example: ['JavaScript', 'Python', 'C++', 'Java'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  options: string[];
}
