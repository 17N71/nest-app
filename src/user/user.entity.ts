import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;
  @Field()
  username: string;
  @Field()
  email: string;
}
