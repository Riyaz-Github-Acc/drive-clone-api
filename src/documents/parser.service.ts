import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';

export interface ParsedSection {
  type: 'heading' | 'subheading' | 'body';
  content: string;
  order: number;
}

@Injectable()
export class ParserService {
  async parse(file: Express.Multer.File): Promise<ParsedSection[]> {
    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.parseWord(file.buffer);
    }
    throw new Error('Only DOCX supported for now');
  }

  private async parseWord(buffer: Buffer): Promise<ParsedSection[]> {
    const result = await mammoth.extractRawText({ buffer });
    return this.parseRawText(result.value);
  }

  private parseRawText(text: string): ParsedSection[] {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const sections: ParsedSection[] = [];
    let order = 0;

    for (const line of lines) {
      order++;

      if (line === line.toUpperCase() && line.length < 60) {
        sections.push({ type: 'heading', content: line, order });
        continue;
      }

      if (line.length < 80) {
        sections.push({ type: 'subheading', content: line, order });
        continue;
      }

      sections.push({ type: 'body', content: line, order });
    }

    return sections;
  }
}
