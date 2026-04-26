import { env } from '@app/config/env';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ParserService } from './parser.service';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, ParserService],
})
export class DocumentsModule {}
