import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Validation: DTO'lardaki kuralların (@IsString, @IsNumber vb.) çalışması için şart
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO'da tanımlanmamış fazladan verileri reddeder
    forbidNonWhitelisted: true,
    transform: true, // Gelen verileri otomatik olarak DTO tiplerine dönüştürür
  }));

  // 2. CORS: Frontend (Nuxt 3) tarafının bu API'ye istek atabilmesi için gerekli
  app.enableCors({
    origin: true, // Herkese açık (veya kendi frontend adresini belirtebilirsin örn: 'http://localhost:3000')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Port Yapılandırması: .env içindeki portu kullanır, yoksa 3001'den başlar (Nuxt ile çakışmaması için)
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${port}`);
}
bootstrap().catch((err) => console.error(err));
