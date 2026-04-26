import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'libs/types/jwt.type';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload;

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }
    return true;
  }
}
