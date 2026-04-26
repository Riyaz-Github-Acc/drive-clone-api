import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  id: uuid().primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  otpCode: text('otp_code'),
  otpExpiresAt: timestamp('otp_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: uuid().primaryKey().defaultRandom(),
  name: text('name').notNull(),
  s3Key: text('s3_key').notNull(),
  mimeType: text('mime_type').notNull(),
  uploadedBy: uuid('uploaded_by')
    .notNull()
    .references(() => admins.id),
  sharedWith: text('shared_with').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sections = pgTable('sections', {
  id: uuid().primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['heading', 'subheading', 'body', 'image'],
  }).notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
