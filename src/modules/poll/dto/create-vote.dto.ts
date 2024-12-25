import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoteDto {
  @ApiProperty({
    description: 'identity of user that voted',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'identity of your poll option',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  optionId: number;
}
