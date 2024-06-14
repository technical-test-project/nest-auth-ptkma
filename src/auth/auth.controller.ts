import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private usersService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body()
    registerUserDto: RegisterDto,
    @Res() response: Response,
  ): Promise<Response> {
    const result = await this.usersService.register(registerUserDto);
    if (!result.status) {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        message: result.message,
        errors: result.errors,
      });
    }

    return response.status(HttpStatus.CREATED).json({
      message: result.message,
      data: await result.data,
    });
  }

  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() loginUserDto: LoginDto,
    @Res() response: Response,
  ): Promise<Response> {
    const result = await this.usersService.login(loginUserDto);

    if (!result.status) {
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        message: result.message,
        errors: result.errors,
      });
    }

    return response.status(HttpStatus.OK).json({
      message: result.message,
      data: result.data,
    });
  }
}
