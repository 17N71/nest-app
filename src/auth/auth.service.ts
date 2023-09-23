import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignUpInput } from './dto/signup-input';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { SignInInput } from './dto/signin-input';
import { ForbiddenError } from '@nestjs/apollo';
import { createTokensReturn } from 'src/types';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  getHello() {
    return 'Hello world';
  }

  async signup(signUpInput: SignUpInput) {
    const hashedPassword = await argon2.hash(signUpInput.password);
    const { password, ...credentials } = signUpInput;
    const user = await this.prisma.user.create({
      data: {
        ...credentials,
        hashedPassword,
      },
    });
    const { accessToken, refreshToken } = await this.createTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);
    const { hashedPassword: hashPass, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  async signin(signInInput: SignInInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: signInInput.login }, { username: signInInput.login }],
      },
    });
    if (!user) throw new ForbiddenException('User not found');

    const isPasswordsMatch = await argon2.verify(
      user.hashedPassword,
      signInInput.password,
    );

    if (!isPasswordsMatch) new ForbiddenError('Password not match');

    const { accessToken, refreshToken } = await this.createTokens(
      user.id,
      user.email,
    );
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedRefreshToken: refreshToken,
      },
    });

    const { hashedPassword: hashPass, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  async logout(id: number) {
    try {
      await this.prisma.user.updateMany({
        where: {
          id,
          hashedRefreshToken: { not: null },
        },
        data: {
          hashedRefreshToken: null,
        },
      });
      return { loggedOut: true };
    } catch {
      return { loggedOut: false };
    }
  }

  async createTokens(
    userId: number,
    email: string,
  ): Promise<createTokensReturn> {
    const accessToken = this.jwtService.sign(
      {
        userId,
        email,
      },
      {
        expiresIn: '1h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId,
        email,
        accessToken,
      },
      {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      },
    );
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async getNewTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const doRefreshTokenMath = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!doRefreshTokenMath) throw new ForbiddenException('Access Denied');

    const { accessToken, refreshToken: rt } = await this.createTokens(
      userId,
      user.email,
    );

    await this.updateRefreshToken(user.id, refreshToken);
    console.log(123);

    return { accessToken, refreshToken: rt, user };
  }
}
