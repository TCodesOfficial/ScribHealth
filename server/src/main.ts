import "dotenv/config"
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import express, { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module.js";


const port = process.env.PORT;
const clientPrefix = process.env.CLIENT_PREFIX as string;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (HTTPie, cURL, Postman, mobile apps)
      if (!origin) return callback(null, true);
  
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173', // Vite default port
        'http://localhost:3001', // Next.js default port
      ];
  
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix(clientPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const jsonParser = express.json();
  const urlencodedParser = express.urlencoded({ extended: true });


  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith(`${clientPrefix}/auth`)) {
      return next();
    }
  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   if (req.path.startsWith("/api/v1/auth")) {
  //     return next();
  //   }

  jsonParser(req, res, (err) => {
    if (err) return next(err);
    urlencodedParser(req, res, next);
  });

    // jsonParser(req, res, (err: unknown) => {
    //   if (err) return next(err as Error);
    //   urlencodedParser(req, res, next);
    // });
  });

  

  await app.listen(port ?? 3000,() => {
    console.log(`Server started on port ${port}`);
  });
}
await bootstrap();