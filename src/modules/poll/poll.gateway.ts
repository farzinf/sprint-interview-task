import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Poll, PollOption } from './entities';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})
export class PollGateway {
  @WebSocketServer() server: Server;

  sendVoteUpdate(
    poll: Omit<Poll, 'id' | 'options'>,
    options: Omit<PollOption, 'id' | 'poll' | 'votes'>[],
  ) {
    this.server.emit('voteUpdate', {
      poll,
      options,
    });
  }
}
