import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { SignUpInput } from './dto/signup-input';
import { SignResponse } from './dto/sign-response';
import { SignInInput } from './dto/signin-input';
import { LogoutResponse } from './dto/logout-response';
import { Public } from './decorators/public.decorator';
import { NewTokenResponse } from './dto/new-tokens-response';
import { CurrentUserId } from './decorators/currentUserId.decorator';
import { CurrentUser } from './decorators/currentUser.decorator';
import { Body, UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { log } from 'console';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  getHello(): string {
    return this.authService.getHello();
  }

  @Mutation(() => SignResponse)
  signup(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authService.signup(signUpInput);
  }

  @Public()
  @Mutation(() => SignResponse)
  signin(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signin(signInInput);
  }

  @Mutation(() => LogoutResponse)
  logout(@Args('id', { type: () => Int }) id: number) {
    return this.authService.logout(id);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Mutation(() => NewTokenResponse)
  getNewTokens(
    @Args('userId', { type: () => Int }) userId: number,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    log(userId, refreshToken);
    return this.authService.getNewTokens(userId, refreshToken);
  }
}
