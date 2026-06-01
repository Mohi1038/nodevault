// src/services/auth.service.ts
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  private userRepository = new UserRepository();

  async register(input: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists', 'EMAIL_TAKEN');
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User profile not found', 'NOT_FOUND');
    }
    return user;
  }
}
