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

  /**
   * Cast a vote for a specific option by a user.
   * @param pollId: ID of the poll.
   * @param userId ID of the user voting.
   * @param optionId ID of the vote option.
   */
  async castVote(
    pollId: number,
    optionId: number,
    userId: number,
  ): Promise<void> {
    const [option, existingVote] = await Promise.all([
      this.optionRepository.findOne({
        where: {
          id: optionId,
          poll: {
            id: pollId,
          },
        },
        relations: ['poll'],
      }),
      this.voteRepository.findOne({
        where: {
          userId,
          option: { poll: { id: pollId } },
        },
        relations: ['option', 'option.poll'],
      }),
    ]);
    if (!option) throw new NotFoundException('Poll or PollOption not found');

    if (existingVote) {
      throw new ConflictException('User has already voted in this poll');
    }

    await this.dataSource.transaction(async (manager) => {
      /* Sqlite does not support the locking
      // Lock the pollOption row for updating
      const pollOption = await manager.findOne(PollOption, {
        where: { id: optionId },
        lock: { mode: 'pessimistic_write' },
      });
      console.log({ pollOption });

      if (!pollOption) {
        throw new Error('Vote option not found.');
      }

      // Increment the vote counter
      pollOption.count += 1;
      await manager.save(PollOption, pollOption);

      // Record the user's vote
      const userVote = manager.create(Vote, { userId, optionId });
      await manager.save(Vote, userVote);
      */

      // Atomic increment using a raw query
      await manager
        .createQueryBuilder()
        .update(PollOption)
        .set({ count: () => 'count + 1' })
        .where('id = :id', { id: optionId })
        .execute();

      // Record the user's vote
      const newVote = manager.create(Vote, { userId, option });
      await manager.save(Vote, newVote);
    });
    const options = await this.optionRepository.find({
      where: { poll: { id: pollId } },
      select: {
        count: true,
        text: true,
      },
    });
    this.pollGateway.sendVoteUpdate(option.poll, options);
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
