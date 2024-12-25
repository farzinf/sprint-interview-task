import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data/voting-system.db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Note: Use migrations in production
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
