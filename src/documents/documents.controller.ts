import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from 'libs/guards/admin.guard';
import { JwtGuard } from 'libs/guards/jwt.guard';
import { JwtPayload } from 'libs/types/jwt.type';

import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // Admin - Upload document
  @Post('upload')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload document (admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sharedWith: string },
    @Request() req: { user: JwtPayload },
  ) {
    const sharedWith = JSON.parse(body.sharedWith) as string[];
    return this.documentsService.uploadDocument(file, sharedWith, req.user.id);
  }

  // User - List shared documents
  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List documents shared with logged in user' })
  findAll(@Request() req: { user: JwtPayload }) {
    return this.documentsService.findSharedWithUser(req.user.email);
  }
}
