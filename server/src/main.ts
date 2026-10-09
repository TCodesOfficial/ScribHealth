import "dotenv/config"
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { getAllowedOrigins } from "./util/allowed-origins.js";
import { isProductionEnv } from "./util/env.js";

const port = process.env.PORT;
const clientPrefix = process.env.CLIENT_PREFIX as string;
const isProduction = isProductionEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (isProduction && getAllowedOrigins().length === 0) {
    console.warn(
      "[CORS] ALLOWED_ORIGINS is empty — every cross-origin browser request will be rejected in production.",
    );
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      if (isProduction) {
        // Production: accept only the frontend origins listed in ALLOWED_ORIGINS.
        return getAllowedOrigins().includes(origin)
          ? callback(null, true)
          : callback(new Error("Blocked by CORS"));
      }

      // Development: allow any origin so local dev servers keep working.
      callback(null, true);
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

  await app.listen(port ?? 3000, () => {
    console.log(`Server started on port ${port}`);
  });
}
await bootstrap();
