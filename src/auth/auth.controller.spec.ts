import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('AuthController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('AuthService', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('register', () => {
    it('should return UNPROCESSABLE_ENTITY if registration fails', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        username: 'johndoe',
        password: 'password123',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response; // Use correct Response typing;
      const mockResult = {
        status: false,
        message: 'Validation Error',
        errors: [{ field: 'username', message: 'Username already exists' }],
      } as any;

      jest.spyOn(authService, 'register').mockResolvedValue(mockResult);

      await controller.register(registerDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation Error',
        errors: [{ field: 'username', message: 'Username already exists' }],
      });
    });

    it('should return CREATED with data if registration succeeds', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        username: 'johndoe',
        password: 'password123',
      };
      const mockResponse: Response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const mockResult = {
        status: true,
        message: 'Successfully registered.',
        data: {
          id: 1,
          username: 'johndoe',
          name: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      jest.spyOn(authService, 'register').mockResolvedValue(mockResult);

      await controller.register(registerDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Successfully registered.',
        data: mockResult.data,
      });
    });
  });

  describe('login', () => {
    it('should return UNPROCESSABLE_ENTITY if login fails', async () => {
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response; // Cast to Response

      const mockResult = {
        status: false,
        message: 'Authentication Failed',
        errors: [
          { field: 'username', message: 'Username or password was incorrect' },
        ],
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(mockResult);

      await controller.login(loginDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentication Failed',
        errors: [
          { field: 'username', message: 'Username or password was incorrect' },
        ],
      });
    });

    it('should return OK with data if login succeeds', async () => {
      const loginDto: LoginDto = {
        username: 'johndoe',
        password: 'password123',
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response; // Cast to Response

      const mockResult = {
        status: true,
        message: 'Authentication Success',
        data: {
          id: 1,
          username: 'johndoe',
          name: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(mockResult);

      await controller.login(loginDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentication Success',
        data: mockResult.data,
      });
    });
  });
});
