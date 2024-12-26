import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll, PollOption, Vote } from './entities';
import { CreatePollDto } from './dto';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly optionRepository: Repository<PollOption>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) {}

  /**
   * Get a list of all polls.
   * @returns A list of polls with their associated options.
   */
  async getAllPolls(): Promise<Poll[]> {
    return this.pollRepository.find({ relations: ['options'] });
  }

  /**
   * Create a new poll with options.
   * @param createPollDto - DTO containing poll question and options.
   * @returns Created poll with options.
   */
  async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
    const { question, options } = createPollDto;

    // Create the poll entity
    const poll = this.pollRepository.create({ question });

    // Save the poll to get an ID
    const savedPoll = await this.pollRepository.save(poll);

    // Create the poll options
    const pollOptions = options.map((optionText) =>
      this.optionRepository.create({ text: optionText, poll: savedPoll }),
    );

    // Save the poll options
    await this.optionRepository.save(pollOptions);

    // Return the poll with its options
    return this.pollRepository.findOne({
      where: { id: savedPoll.id },
      relations: ['options'],
    });
  }

  /**
   * Delete an existing poll by ID.
   * @param pollId - ID of the poll to be deleted.
   * @returns True if poll was deleted, false otherwise.
   */
  async deletePoll(pollId: number): Promise<boolean> {
    const deleteResult = await this.pollRepository.delete(pollId);
    return deleteResult.affected > 0;
  }

  async castVote(
    pollId: number,
    optionId: number,
    userId: number,
  ): Promise<void> {
    // Fetch the poll option and ensure it exists
    const option = await this.optionRepository.findOne({
      where: {
        id: optionId,
        poll: {
          id: pollId,
        },
      },
      relations: ['poll'],
    });
    if (!option) throw new NotFoundException('Poll option not found');

    // Check if the user has already voted in this poll
    const existingVote = await this.voteRepository.findOne({
      where: {
        userId,
        option: { poll: option.poll }, // Ensure the user hasn't voted in this poll
      },
      relations: ['option', 'option.poll'],
    });

    if (existingVote) {
      throw new ConflictException('User has already voted in this poll');
    }

    // Create and save the new vote
    const vote = this.voteRepository.create({ userId, option });
    await this.voteRepository.save(vote);
  }

  async getPollResults(pollId: number): Promise<PollOption[]> {
    const options = await this.optionRepository.find({
      where: { poll: { id: pollId } },
      relations: ['votes'],
    });
    if (!options || options.length === 0)
      throw new NotFoundException('Poll not found');

    return options;
  }
}
