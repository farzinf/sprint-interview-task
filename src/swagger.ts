import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function swaggerSetup(app: INestApplication<any>) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Voting System API')
    .setDescription('API for real-time voting system')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });
}
