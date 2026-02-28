import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable Global Validation Pipe for DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Enable CORS
    app.enableCors();

    // Prefix global routes
    app.setGlobalPrefix('api/v1');

    // Configure Swagger
    const config = new DocumentBuilder()
        .setTitle('SprintFit API')
        .setDescription('Documentación de la API para el E-commerce de SprintFit')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    Logger.log(`Application running on port ${port}`);
    Logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
