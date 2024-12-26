import { Test, TestingModule } from '@nestjs/testing';
import { PollGateway } from './poll.gateway';
import { Server } from 'socket.io';

describe('PollGateway', () => {
  let gateway: PollGateway;

  const mockServer = {
    emit: jest.fn(),
  };

  const mockClient = {
    id: 'mock-client-id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PollGateway],
    }).compile();

    gateway = module.get<PollGateway>(PollGateway);
    gateway.server = mockServer as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should emit vote update', () => {
    const poll = {
      question: 'What is your favorite programming language?',
    };
    const options = [
      {
        text: 'JavaScript',
        count: 2,
      },
      { text: 'Python', count: 1 },
      { text: 'C++', count: 0 },
      { text: 'Java', count: 0 },
    ];

    gateway.sendVoteUpdate(poll, options);

    expect(mockServer.emit).toHaveBeenCalledWith('voteUpdate', {
      poll,
      options,
    });
  });

});
