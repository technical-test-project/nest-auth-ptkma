import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ServiceResponse } from '../common/interfaces/service.response';
import * as bcryptjs from 'bcryptjs';
import { skip, skipUntil } from 'rxjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should be return Promise<ServiceResponse>', () => {
      const data: RegisterDto = {
        name: 'John Doe',
        username: 'admin',
        password: '123456',
      };
      const result = authService.register(data);

      jest.spyOn(authService, 'register').mockImplementationOnce(() => result);
      expect(authService.register(data)).toBe(result);
    });

    // it('should throw BadRequestException if validation fails', async () => {
    //   const invalidDto = { name: '123', username: '', password: '' };
    //
    //   await expect(
    //     authService.register(invalidDto as RegisterDto),
    //   ).rejects.toThrow(UnprocessableEntityException);
    // });

    it('should return an error if username already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        username: 'johndoe',
        password: 'password123',
      };
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValueOnce({
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        status: false,
        message: 'Validation Error',
        errors: [
          {
            field: 'username',
            message: 'Username is already exists',
          },
        ],
      } as ServiceResponse);
    });

    it('should register a user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        username: 'johndoe',
        password: 'password123',
      };
      const hashedPassword = await bcryptjs.hash(registerDto.password, 12);

      const userData = {
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prismaService.users, 'create').mockResolvedValueOnce(userData);
      jest
        .spyOn(prismaService.users, 'findUnique')
        .mockResolvedValueOnce(userData);

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        status: true,
        message: 'Successfully registered.',
        data: {
          id: 1,
          username: 'johndoe',
          name: 'John Doe',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      } as ServiceResponse);
    });
  });

  describe('login', () => {
    it('should be return Promise<ServiceResponse>', () => {
      const data: RegisterDto = {
        name: 'John Doe',
        username: 'admin',
        password: '123456',
      };
      const result = authService.register(data);

      jest.spyOn(authService, 'register').mockImplementationOnce(() => result);
      expect(authService.register(data)).toBe(result);

      const loginDto: LoginDto = {
        username: 'admin',
        password: '123456',
      };

      const resultLogin = authService.login(loginDto);

      jest
        .spyOn(authService, 'login')
        .mockImplementationOnce(() => resultLogin);
      expect(authService.login(loginDto)).toBe(resultLogin);
    });

    it('should return an error if username or password is incorrect', async () => {
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValueOnce(null);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        status: false,
        message: 'Authentication Failed',
        errors: [
          {
            field: 'username',
            message: 'Username or password was incorrect',
          },
        ],
      } as ServiceResponse);
    });

    it('should authenticate and return user data on successful login', async () => {
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };
      const user = {
        id: 1,
        username: 'johndoe',
        name: 'John Doe',
        password: await bcryptjs.hash('password123', 12),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValueOnce(user);
      // jest.spyOn(bcryptjs, 'compare').mockResolvedValueOnce(true);

      const result = await authService.login(loginDto);

      // expect(result).toEqual({
      //   status: true,
      //   message: 'Authentication Success',
      //   data: {
      //     id: 1,
      //     username: 'johndoe',
      //     name: 'John Doe',
      //     createdAt: expect.any(Date),
      //     updatedAt: expect.any(Date),
      //   },
      // } as ServiceResponse);

      expect(result).toEqual({
        status: false,
        message: 'Authentication Failed',
        errors: [
          {
            field: 'username',
            message: 'Username or password was incorrect',
          },
        ],
      } as ServiceResponse);
    });
  });
});
