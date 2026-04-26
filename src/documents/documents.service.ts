import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { cloudinary } from 'libs/cloudinary';
import { db } from 'libs/drizzle';
import { documents } from 'libs/drizzle/schema';

@Injectable()
export class DocumentsService {
  // Admin - Upload document to Cloudinary
  async uploadDocument(
    file: Express.Multer.File,
    sharedWith: string[],
    adminId: string,
  ) {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: 'raw',
              folder: 'drive-clone',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            },
          )
          .end(file.buffer);
      },
    );

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

    return doc;
  }

  // User - List documents shared with their email
  async findSharedWithUser(email: string) {
    const docs = await db.query.documents.findMany();
    return docs.filter((doc) => doc.sharedWith.includes(email));
  }

  // User - Get single document (check access)
  async findOne(id: string, email: string) {
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (!doc.sharedWith.includes(email))
      throw new ForbiddenException('Access denied');

    return doc;
  }
}
