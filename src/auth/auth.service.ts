import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ServiceResponse } from '../common/interfaces/service.response';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterDto): Promise<ServiceResponse> {
    const { name, username, password } = registerUserDto;
    const hashedPassword = await bcryptjs.hash(password, 12);

    try {
      const usernameExists = await this.prismaService.users.findUnique({
        where: { username },
      });

      if (usernameExists) {
        return {
          status: false,
          message: 'Validation Error',
          errors: [
            {
              field: 'username',
              message: 'Username is already exists',
            },
          ],
        } as ServiceResponse;
      }

      await this.prismaService.users.create({
        data: {
          name,
          username,
          password: hashedPassword,
        },
      });

      const userData = await this.prismaService.users.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          password: false,
          createdAt: true,
          updatedAt: true,
        },
      });

      const payload = { sub: userData?.id, username: userData?.username };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        status: true,
        message: 'Successfully registered.',
        data: { ...userData, accessToken },
      } as ServiceResponse;
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errors: error.errors,
      } as ServiceResponse;
    }
  }

  async login(loginUserDto: LoginDto): Promise<ServiceResponse> {
    const { username, password } = loginUserDto;
    const findUser = await this.prismaService.users.findUnique({
      where: { username },
    });
    if (findUser && (await bcryptjs.compare(password, findUser.password))) {
      const user = await this.prismaService.users.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          password: false,
          createdAt: true,
          updatedAt: true,
        },
      });

      const payload = { sub: user?.id, username: user?.username };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        status: true,
        message: 'Authentication Success',
        data: { ...user, accessToken },
      } as ServiceResponse;
    }

    return {
      status: false,
      message: 'Authentication Failed',
      errors: [
        {
          field: 'username',
          message: 'Username or password was incorrect',
        },
      ],
    } as ServiceResponse;
  }
}
