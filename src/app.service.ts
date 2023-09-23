import { Injectable } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
@Resolver()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
}
