import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
