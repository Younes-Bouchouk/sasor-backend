// payments.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { IsEmail, IsNotEmpty } from 'class-validator';

class CreatePaymentSheetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('sheet')
  @UsePipes(new ValidationPipe())
  async createPaymentSheet(@Body() createPaymentSheetDto: CreatePaymentSheetDto) {
    return this.paymentsService.createPaymentSheet(createPaymentSheetDto.email);
  }
}