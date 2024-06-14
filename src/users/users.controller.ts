import { Controller, Get, HttpStatus, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async userProfile(@Request() req: any, @Res() response: Response) {
    const reqUser: any = req.user;
    const result = await this.usersService.userProfile(reqUser);

    return response.status(HttpStatus.OK).json({
      message: result.message,
      data: result.data,
    });
  }
}
