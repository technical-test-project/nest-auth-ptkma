import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceResponse } from '../common/interfaces/service.response';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async userProfile(reqUser: any): Promise<ServiceResponse> {
    const { sub } = reqUser;
    const userData = await this.prismaService.users.findFirst({
      where: {
        id: sub,
      },
      select: {
        id: false,
        username: true,
        name: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      status: true,
      message: 'User Profile',
      data: userData,
    } as ServiceResponse;
  }
}
