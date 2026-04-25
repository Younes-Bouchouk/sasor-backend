import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getSalem(): string {
        return 'السَّلَامُ عَلَيْكُمْ وَ رَحْمَةُ اللهِ وَ بَرَكاتُهُ';
    }
}
