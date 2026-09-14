// import { Module } from "@nestjs/common";
// import { AuthModule } from "./auth/auth.module.js";
// import { UserModule } from "./user/user.module.js";
// import { PrismaModule } from "./prisma/prisma.module.js";
// import { ConsultationModule } from "./consultation/consultation.module.js";
// import { BenchmarkModule } from "./benchmark/benchmark.module.js";
// import { AppController } from "./app.controller.js";
// import { AppService } from "./app.service.js";
// import env from "dotenv"
// env.config()

// @Module({
//   imports: [
//     PrismaModule,
//     AuthModule,
//     UserModule,
//     ConsultationModule,
//     BenchmarkModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


// src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { getAuthConfig } from "./auth/auth.js"; // Import the factory instead of static instance
import { AuthModule } from "./auth/auth.module.js";
import { BenchmarkModule } from "./benchmark/benchmark.module.js";
import { ConsultationModule } from "./consultation/consultation.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { UserModule } from "./user/user.module.js";

@Module({
  imports: [
    PrismaModule,
    BetterAuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prismaService: PrismaService) => ({
        // Evaluate the configuration mapping here safely at runtime
        auth: getAuthConfig(prismaService),
      }),
    }),
    AuthModule,
    UserModule,
    ConsultationModule,
    BenchmarkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
