import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseExceptionFilter } from './database-exception.filter';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data/voting-system.sqlite3',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Note: Use migrations in production
    }),
  ],
  exports: [TypeOrmModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
})
export class DatabaseModule {}
