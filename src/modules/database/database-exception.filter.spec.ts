import { DatabaseExceptionFilter } from './database-exception.filter'; // Adjust the import path
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { Response } from 'express';

describe('DatabaseExceptionFilter', () => {
  let filter: DatabaseExceptionFilter;
  let response: Response;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new DatabaseExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ url: '/test' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle QueryFailedError', () => {
    const exception = new QueryFailedError('query', [], {
      name: 'SQLITE_CONSTRAINT',
      message: 'UNIQUE constraint failed: poll_option.text, poll_option.pollId',
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'UNIQUE constraint failed: poll_option.text, poll_option.pollId',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle EntityNotFoundError', () => {
    const exception = new EntityNotFoundError('Poll', 'id');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Could not find any entity of type \"Poll\" matching: \"id\"',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle other TypeORMError types', () => {
    const exception = new Error('Some other TypeORM error');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database exception',
      timestamp: expect.any(String),
      path: '/test',
    });
  });
});
