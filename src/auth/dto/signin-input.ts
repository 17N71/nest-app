import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignInInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  @MinLength(3)
  login: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  @MinLength(8)
  password: string;
}
