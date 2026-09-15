import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { getAuthConfig } from "./auth/auth.js";
import { AuthModule } from "./auth/auth.module.js";
import { BenchmarkModule } from "./benchmark/benchmark.module.js";
import { ConsultationModule } from "./consultation/consultation.module.js";
import { GroqModule } from "./groq/groq.module.js";
import { PatientModule } from "./patient/patient.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { UserModule } from "./user/user.module.js";
import { ResponseInterceptor } from "./util/interceptors/response.interceptor.js";

@Module({
  imports: [
    PrismaModule,
    GroqModule,
    BetterAuthModule.forRootAsync({
      disableGlobalAuthGuard: true,
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prismaService: PrismaService) => ({
        auth: getAuthConfig(prismaService),
      }),
    }),
    AuthModule,
    UserModule,
    ConsultationModule,
    PatientModule,
    BenchmarkModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
