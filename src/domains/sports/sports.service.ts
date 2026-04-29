import { Injectable } from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SportsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSportDto: CreateSportDto) {
    return 'This action adds a new sport';
  }

  findAll() {
    return this.prisma.sport.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} sport`;
  }

  update(id: number, updateSportDto: UpdateSportDto) {
    return `This action updates a #${id} sport`;
  }

  remove(id: number) {
    return `This action removes a #${id} sport`;
  }
}
