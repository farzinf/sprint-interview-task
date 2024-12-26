import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Delete,
  HttpCode,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { CreatePollDto, CreateVoteDto } from './dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Poll } from './entities';

@ApiTags('Polls')
@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  /**
   * Get a list of all polls.
   */
  @ApiOperation({ summary: 'Get a list of all polls' })
  @ApiResponse({
    status: 200,
    description: 'List of polls retrieved successfully',
    type: [Poll], // Specify the entity type returned
  })
  @Get()
  async getAllPolls(): Promise<Poll[]> {
    return this.pollService.getAllPolls();
  }

  /**
   * Create a new poll.
   * @param createPollDto - DTO containing the question and options for the poll.
   */

  @ApiOperation({ summary: 'Create a new poll' })
  @ApiResponse({ status: 201, description: 'Poll created successfully' })
  @ApiBody({ type: CreatePollDto })
  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    return this.pollService.createPoll(createPollDto);
  }

  /**
   * Delete an existing poll.
   * @param pollId - ID of the poll to be deleted.
   */
  @ApiOperation({ summary: 'Delete an existing poll' })
  @ApiResponse({ status: 204, description: 'Poll deleted successfully' })
  @ApiResponse({ status: 404, description: 'Poll not found' })
  @ApiParam({
    name: 'pollId',
    type: 'number',
    description: 'ID of the poll to delete',
  })
  @Delete(':pollId')
  @HttpCode(204)
  async deletePoll(@Param('pollId', new ParseIntPipe()) pollId: number) {
    const deleted = await this.pollService.deletePoll(pollId);
    if (!deleted) {
      throw new NotFoundException(`Poll with ID ${pollId} not found`);
    }
  }

  /**
   * Create a new vote.
   * @param pollId - ID of the poll to voted.
   * @param createPollDto - DTO containing the userId and option id for the vote.
   */

  @ApiOperation({ summary: 'Create a new vote' })
  @ApiResponse({ status: 201, description: 'Vote created successfully' })
  @ApiBody({ type: CreateVoteDto })
  @Post(':pollId/vote')
  async vote(
    @Param('pollId', new ParseIntPipe()) pollId: number,
    @Body() voteDto: CreateVoteDto,
  ) {
    return this.pollService.castVote(pollId, voteDto.optionId, voteDto.userId);
  }

  /**
   * Get result of a poll.
   * @param pollId - ID of the poll.
   */

  @ApiOperation({ summary: 'Get result of a poll.' })
  @ApiResponse({
    status: 200,
    description: 'Result of a poll retrieved successfully',
    type: Poll,
  })
  @Get(':pollId/results')
  async getResults(@Param('pollId', new ParseIntPipe()) pollId: number) {
    return this.pollService.getPollResults(pollId);
  }
}
