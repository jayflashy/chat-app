import User from '../modules/user/user.model';
import { UserService } from '../modules/user/user.service';

jest.mock('../modules/user/user.model');
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

type AnyFn = (...args: any[]) => any;

describe('UserService', () => {
  const mockedUser = User as unknown as jest.Mocked<typeof User> & {
    findOne: jest.Mock<AnyFn>;
    findById: jest.Mock<AnyFn>;
    findOneAndUpdate: jest.Mock<AnyFn>;
    find: jest.Mock<AnyFn>;
    countDocuments: jest.Mock<AnyFn>;
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('emailExists returns true when user found', async () => {
    mockedUser.findOne = jest.fn().mockResolvedValue({ _id: 'u1' });
    const exists = await UserService.emailExists('a@b.com');
    expect(exists).toBe(true);
    expect(mockedUser.findOne).toHaveBeenCalledWith({
      email: 'a@b.com',
      isActive: true,
    });
  });

  it('emailExists returns false when user not found', async () => {
    mockedUser.findOne = jest.fn().mockResolvedValue(null);
    const exists = await UserService.emailExists('a@b.com');
    expect(exists).toBe(false);
  });

  it('findByEmailWithPassword selects +password', async () => {
    const select = jest.fn().mockResolvedValue({ _id: 'u1', password: 'hash' });
    mockedUser.findOne = jest.fn().mockReturnValue({ select });
    const user = await UserService.findByEmailWithPassword('a@b.com');
    expect(mockedUser.findOne).toHaveBeenCalledWith({
      email: 'a@b.com',
      isActive: true,
    });
    expect(select).toHaveBeenCalledWith('+password');
    expect(user).toBeTruthy();
  });

  it('updateUser returns updated doc and logs', async () => {
    const updated = { _id: 'u1', email: 'a@b.com' } as any;
    mockedUser.findOneAndUpdate = jest.fn().mockResolvedValue(updated);
    const res = await UserService.updateUser('u1', { name: 'New' } as any);
    expect(res).toBe(updated);
    expect(mockedUser.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'u1', isActive: true },
      { name: 'New' },
      { new: true, runValidators: true },
    );
  });

  it('deleteUser soft-deletes and logs', async () => {
    const deleted = { _id: 'u1', email: 'a@b.com', isActive: false } as any;
    mockedUser.findOneAndUpdate = jest.fn().mockResolvedValue(deleted);
    const res = await UserService.deleteUser('u1');
    expect(res).toBe(deleted);
    expect(mockedUser.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'u1', isActive: true },
      { isActive: false },
      { new: true },
    );
  });

  it('getAllUsers returns paginated result', async () => {
    const limit = jest.fn().mockResolvedValue([{ _id: 'u1' }]);
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    const select = jest.fn().mockReturnValue({ sort });
    mockedUser.find = jest.fn().mockReturnValue({ select });
    mockedUser.countDocuments = jest.fn().mockResolvedValue(12);

    const res = await UserService.getAllUsers(2, 5);
    expect(res.users.length).toBe(1);
    expect(res.total).toBe(12);
    expect(res.pages).toBe(3);
    expect(res.currentPage).toBe(2);
    expect(mockedUser.find).toHaveBeenCalledWith({ isActive: true });
  });

  it('updateOnlineStatus calls instance.setOnlineStatus', async () => {
    const setOnlineStatus = jest.fn().mockResolvedValue(undefined);
    mockedUser.findById = jest
      .fn()
      .mockResolvedValue({ email: 'a@b.com', setOnlineStatus } as any);
    const res = await UserService.updateOnlineStatus('u1', true);
    expect(res).toBeTruthy();
    expect(setOnlineStatus).toHaveBeenCalledWith(true);
  });

  it('updateLastSeen calls instance.updateLastSeen', async () => {
    const updateLastSeen = jest.fn().mockResolvedValue(undefined);
    mockedUser.findById = jest
      .fn()
      .mockResolvedValue({ updateLastSeen } as any);
    const res = await UserService.updateLastSeen('u1');
    expect(res).toBeTruthy();
    expect(updateLastSeen).toHaveBeenCalled();
  });
});
