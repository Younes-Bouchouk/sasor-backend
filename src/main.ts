import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();

    // Render injecte automatiquement la variable PORT
    const port = process.env.PORT || 4000;

    // Obligatoire : écouter sur 0.0.0.0 pour que Render puisse router le trafic
    await app.listen(port, '0.0.0.0');
    
    console.log(`Application is running on port: ${port}`);
}
bootstrap();