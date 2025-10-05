import { AuthService } from '../modules/auth/auth.service';
import { UserService } from '../modules/user/user.service';

jest.mock('../modules/user/user.service');

describe('AuthService', () => {
  const mockedUserService = jest.mocked(UserService);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('register should create user and return token', async () => {
    mockedUserService.emailExists.mockResolvedValue(false);
    mockedUserService.usernameExists.mockResolvedValue(false);
    mockedUserService.createUser.mockResolvedValue({
      _id: 'user123',
      email: 'john@example.com',
      username: 'johndoe',
    } as any);

    const result = await AuthService.register({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      name: 'John Doe',
    });

    expect(result.success).toBe(true);
    expect(result.data.token).toBeDefined();
  });

  it('login should return token for valid credentials', async () => {
    mockedUserService.findByEmailWithPassword.mockResolvedValue({
      _id: 'user123',
      email: 'john@example.com',
      username: 'johndoe',
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(true),
      setOnlineStatus: jest.fn().mockResolvedValue(undefined),
    } as any);

    const result = await AuthService.login({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.data.token).toBeDefined();
  });
});

