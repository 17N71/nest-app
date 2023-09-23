import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { log } from 'console';
import { JwtPayloadWithRefreshToken } from 'src/types';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWithRefreshToken | undefined,
    context: ExecutionContext,
  ) => {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    log(ctx.getContext().userId);
    if (data) return req?.user?.[data];
    return req?.user;
  },
);
