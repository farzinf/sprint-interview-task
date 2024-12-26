import { Test, TestingModule } from '@nestjs/testing';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { Poll, PollOption } from './entities';
import { CreatePollDto } from './dto';

describe('PollController', () => {
  let controller: PollController;
  let service: PollService;

  const mockResponse = {
    set: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };

  const mockPollService = {
    getAllPolls: jest.fn(),
    createPoll: jest.fn(),
    deletePoll: jest.fn(),
    castVote: jest.fn(),
    getPollResults: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollController],
      providers: [
        {
          provide: PollService,
          useValue: mockPollService,
        },
      ],
    }).compile();

    controller = module.get<PollController>(PollController);
    service = module.get<PollService>(PollService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPolls', () => {
    it('should return an array of polls', async () => {
      const expectedPolls: Poll[] = [
        {
          id: 1,
          question: 'Test Question',
          options: [
            { id: 1, text: 'Option 1', count: 0, poll: null, votes: [] },
            { id: 2, text: 'Option 2', count: 0, poll: null, votes: [] },
          ],
        },
      ];

      mockPollService.getAllPolls.mockResolvedValue(expectedPolls);

      const result = await controller.getAllPolls();

      expect(result).toBe(expectedPolls);
      expect(mockPollService.getAllPolls).toHaveBeenCalled();
    });

    it('should handle empty polls array', async () => {
      mockPollService.getAllPolls.mockResolvedValue([]);

      const result = await controller.getAllPolls();

      expect(result).toEqual([]);
      expect(mockPollService.getAllPolls).toHaveBeenCalled();
    });
  });

  describe('createPoll', () => {
    it('should create a new poll', async () => {
      const createPollDto: CreatePollDto = {
        question: 'Test Question',
        options: ['Option 1', 'Option 2'],
      };

      const expectedPoll: Poll = {
        id: 1,
        question: createPollDto.question,
        options: [
          { id: 1, text: 'Option 1', count: 0, poll: null, votes: [] },
          { id: 2, text: 'Option 2', count: 0, poll: null, votes: [] },
        ],
      };

      mockPollService.createPoll.mockResolvedValue(expectedPoll);

      const result = await controller.createPoll(createPollDto);

      expect(result).toBe(expectedPoll);
      expect(mockPollService.createPoll).toHaveBeenCalledWith(createPollDto);
    });

  });

  describe('deletePoll', () => {
    it('should delete a poll successfully', async () => {
      const pollId = 1;
      mockPollService.deletePoll.mockResolvedValue(true);

      const result = await controller.deletePoll(pollId);

      expect(result).toBe(true);
      expect(mockPollService.deletePoll).toHaveBeenCalledWith(pollId);
    });

  });

  describe('castVote', () => {
    it('should cast a vote successfully', async () => {
      const pollId = 1;
      const optionId = 1;
      const userId = 1;

      mockPollService.castVote.mockResolvedValue(undefined);

      await controller.vote(pollId, { userId, optionId });

      expect(mockPollService.castVote).toHaveBeenCalledWith(
        pollId,
        optionId,
        userId,
      );
    });

  });

  describe('getPollResults', () => {
    it('should return poll results', async () => {
      const pollId = 1;
      const expectedResults: PollOption[] = [
        { id: 1, text: 'Option 1', count: 5, poll: null, votes: [] },
        { id: 2, text: 'Option 2', count: 3, poll: null, votes: [] },
      ];

      mockPollService.getPollResults.mockResolvedValue(expectedResults);

      const result = await controller.getResults(pollId);

      expect(result).toBe(expectedResults);
      expect(mockPollService.getPollResults).toHaveBeenCalledWith(pollId);
    });

    it('should handle non-existent poll results', async () => {
      const pollId = 999;
      mockPollService.getPollResults.mockRejectedValue(
        new Error('Poll not found'),
      );

      await expect(controller.getResults(pollId)).rejects.toThrow();
    });
  });

  // If you have any custom decorators or pipes, test them here
  describe('Parameter validation', () => {
    it('should validate poll ID parameter', async () => {
      const invalidPollId = 'not-a-number';

      // This test assumes you're using ParseIntPipe or similar
      await expect(
        controller.getResults(invalidPollId as any),
      ).rejects.toThrow();
    });

  });

  describe('Response transformation', () => {
    it('should properly transform poll response', async () => {
      const poll: Poll = {
        id: 1,
        question: 'Test Question',
        options: [{ id: 1, text: 'Option 1', count: 0, poll: null, votes: [] }],
      };

      mockPollService.getAllPolls.mockResolvedValue([poll]);

      const result = await controller.getAllPolls();
      const transformedPoll = result[0];

      expect(transformedPoll).toHaveProperty('id');
      expect(transformedPoll).toHaveProperty('question');
      expect(transformedPoll).toHaveProperty('options');
      expect(Array.isArray(transformedPoll.options)).toBe(true);
    });
  });
});
