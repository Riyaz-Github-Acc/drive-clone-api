import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { cloudinary } from 'libs/cloudinary';
import { db } from 'libs/drizzle';
import { documents, sections } from 'libs/drizzle/schema';

import { ParserService } from './parser.service';

@Injectable()
export class DocumentsService {
  constructor(private parserService: ParserService) {}

  async uploadDocument(
    file: Express.Multer.File,
    sharedWith: string[],
    adminId: string,
  ) {
    // 1. Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: 'raw', folder: 'drive-clone' },
            (error, result) => {
              if (error) reject(new Error(error.message));
              else resolve(result as { secure_url: string; public_id: string });
            },
          )
          .end(file.buffer);
      },
    );

    // 2. Parse document
    const parsedSections = await this.parserService.parse(file);

    // 3. Save document metadata
    const [doc] = await db
      .insert(documents)
      .values({
        name: file.originalname,
        s3Key: result.public_id,
        mimeType: file.mimetype,
        sharedWith,
        uploadedBy: adminId,
      })
      .returning();

    // 4. Save sections
    if (parsedSections.length > 0) {
      await db.insert(sections).values(
        parsedSections.map((s) => ({
          documentId: doc.id,
          type: s.type,
          content: s.content,
          order: s.order,
        })),
      );
    }

    return {
      ...doc,
      sections: parsedSections,
    };
  }

  async findSharedWithUser(email: string) {
    const docs = await db.query.documents.findMany();
    return docs.filter((doc) => doc.sharedWith.includes(email));
  }

  async findOne(id: string, email: string) {
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (!doc.sharedWith.includes(email))
      throw new ForbiddenException('Access denied');

    // Get sections
    const docSections = await db.query.sections.findMany({
      where: eq(sections.documentId, id),
      orderBy: sections.order,
    });

    return { ...doc, sections: docSections };
  }
}
