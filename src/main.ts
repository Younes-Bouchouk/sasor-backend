import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as os from 'os';

function getLocalIp(): string {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const alias of iface ?? []) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
} 

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors()

    const port = process.env.PORT ?? 4000;
    await app.listen(port);

    const ip = getLocalIp();
    console.log(`Serveur lancé sur http://localhost:${port}`);
    console.log(`Accès réseau : http://${ip}:${port}`);
}
bootstrap();
