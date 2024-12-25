import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerSetup } from './swagger';

async function bootstrap() {
  swaggerSetup(app);
  await app.listen(3000);
}
bootstrap();
