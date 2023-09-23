import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignUpInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  @MinLength(8)
  password: string;
}
