import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { of } from 'rxjs';
import * as bcryptjs from 'bcryptjs';
import { KafkaServices } from './kafka/kafka-constants';
import { KafkaTopics } from './kafka/kafka-topics.enum';

describe('AuthService - login', () => {
  let service: AuthService;

  const mockKafkaClient = {
    send: jest.fn(),
    subscribeToResponseOf: jest.fn(),
    connect: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: KafkaServices.USER_LOGIN_SERVICE,
          useValue: mockKafkaClient,
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('✅ debe iniciar sesión correctamente', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: '123456',
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: await bcryptjs.hash(loginDto.password, 10),
      role: 'user',
    };

    mockKafkaClient.send.mockReturnValue(of({ data: mockUser }));
    mockJwtService.signAsync.mockResolvedValue('fake-jwt-token');

    const result = await service.login(loginDto);

    expect(result).toEqual({
      token: 'fake-jwt-token',
      email: 'test@example.com',
    });

    expect(mockKafkaClient.send).toHaveBeenCalledWith(
      KafkaTopics.GET_USER_BY_EMAIL_WITH_PASSWORD,
      loginDto.email,
    );

    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      id: mockUser.id,
      email: mockUser.email,
      roles: [mockUser.role],
    });
  });
});
