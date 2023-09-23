import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { log } from 'console';
import { JwtPayload } from 'src/types';

export const CurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    log(req.userId);
    log(req.user.userId);
    return (req.user as JwtPayload).userId;
  },
);
