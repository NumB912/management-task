import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
 @Get('me')
  findAll(): string {
    return 'This action returns all cats';
  }
}
