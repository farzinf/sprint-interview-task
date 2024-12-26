import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PollService } from './poll.service';
import { Poll, PollOption, Vote } from './entities';
import { CreatePollDto } from './dto';
import { PollGateway } from './poll.gateway';

describe('PollService', () => {
  let service: PollService;
  let pollRepository: Repository<Poll>;
  let optionRepository: Repository<PollOption>;
  let voteRepository: Repository<Vote>;
  let pollGateway: PollGateway;
  let dataSource: DataSource;

  const mockPollGateway = {
    sendVoteUpdate: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollService,
        {
          provide: getRepositoryToken(Poll),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PollOption),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Vote),
          useClass: Repository,
        },
        {
          provide: PollGateway,
          useValue: mockPollGateway,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PollService>(PollService);
    pollRepository = module.get<Repository<Poll>>(getRepositoryToken(Poll));
    optionRepository = module.get<Repository<PollOption>>(
      getRepositoryToken(PollOption),
    );
    voteRepository = module.get<Repository<Vote>>(getRepositoryToken(Vote));
    pollGateway = module.get<PollGateway>(PollGateway);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPolls', () => {
    it('should return all polls with their options', async () => {
      const expectedPolls = [
        {
          id: 1,
          question: 'Test Question',
          options: [{ id: 1, text: 'Option 1' }],
        },
      ];

      jest
        .spyOn(pollRepository, 'find')
        .mockResolvedValue(expectedPolls as Poll[]);

      const result = await service.getAllPolls();

      expect(result).toEqual(expectedPolls);
      expect(pollRepository.find).toHaveBeenCalledWith({
        relations: ['options'],
      });
    });
  });

  describe('createPoll', () => {
    it('should create a new poll with options', async () => {
      const createPollDto: CreatePollDto = {
        question: 'Test Question',
        options: ['Option 1', 'Option 2'],
      };

      const createdPoll = {
        id: 1,
        question: createPollDto.question,
      };

      const savedPoll = {
        ...createdPoll,
        options: [
          { id: 1, text: 'Option 1' },
          { id: 2, text: 'Option 2' },
        ],
      };

      jest.spyOn(pollRepository, 'create').mockReturnValue(createdPoll as Poll);
      jest.spyOn(pollRepository, 'save').mockResolvedValue(createdPoll as Poll);
      jest
        .spyOn(optionRepository, 'create')
        .mockImplementation((option: any) => option);
      jest.spyOn(optionRepository, 'save').mockResolvedValue(undefined);
      jest
        .spyOn(pollRepository, 'findOne')
        .mockResolvedValue(savedPoll as Poll);

      const result = await service.createPoll(createPollDto);

      expect(result).toEqual(savedPoll);
      expect(pollRepository.create).toHaveBeenCalledWith({
        question: createPollDto.question,
      });
      expect(pollRepository.save).toHaveBeenCalled();
      expect(optionRepository.save).toHaveBeenCalled();
      expect(pollRepository.findOne).toHaveBeenCalledWith({
        where: { id: createdPoll.id },
        relations: ['options'],
      });
    });
  });

  describe('deletePoll', () => {
    it('should delete a poll successfully', async () => {
      const pollId = 1;
      jest
        .spyOn(pollRepository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.deletePoll(pollId);

      expect(result).toBe(true);
      expect(pollRepository.delete).toHaveBeenCalledWith(pollId);
    });

    it('should return false when poll does not exist', async () => {
      const pollId = 999;
      jest
        .spyOn(pollRepository, 'delete')
        .mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.deletePoll(pollId);

      expect(result).toBe(false);
      expect(pollRepository.delete).toHaveBeenCalledWith(pollId);
    });
  });

  describe('castVote', () => {
    const pollId = 1;
    const optionId = 1;
    const userId = 1;

    const mockOption = {
      id: optionId,
      text: 'Option 1',
      poll: { id: pollId },
    };

      const existingVote = {
        id: 1,
        userId,
        option: { poll: { id: pollId } },
      };

      jest
        .spyOn(optionRepository, 'findOne')
        .mockResolvedValue(mockOption as any);
      jest
        .spyOn(voteRepository, 'findOne')
        .mockResolvedValue(existingVote as Vote);

      await expect(service.castVote(pollId, optionId, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getPollResults', () => {
    it('should return poll results successfully', async () => {
      const pollId = 1;
      const mockOptions = [
        { id: 1, text: 'Option 1', votes: [{ id: 1 }] },
        { id: 2, text: 'Option 2', votes: [] },
      ];

      jest
        .spyOn(optionRepository, 'find')
        .mockResolvedValue(mockOptions as PollOption[]);

      const result = await service.getPollResults(pollId);

      expect(result).toEqual(mockOptions);
      expect(optionRepository.find).toHaveBeenCalledWith({
        where: { poll: { id: pollId } },
        relations: ['votes'],
      });
    });

    it('should throw NotFoundException when poll not found', async () => {
      const pollId = 999;
      jest.spyOn(optionRepository, 'find').mockResolvedValue([]);

      await expect(service.getPollResults(pollId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
