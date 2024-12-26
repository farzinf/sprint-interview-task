import { Module } from '@nestjs/common';
import { DatabaseModule, PollModule } from './modules';

@Module({
  imports: [DatabaseModule, PollModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
