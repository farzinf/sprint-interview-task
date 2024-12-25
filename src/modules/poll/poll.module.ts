import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll, Vote, PollOption } from './entities';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollOption, Vote])],
  controllers: [PollController],
  providers: [PollService],
  exports: [PollService],
})
export class PollModule {}
