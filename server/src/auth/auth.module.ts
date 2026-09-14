// import { Module } from "@nestjs/common";
// import { AuthController } from "./auth.controller.js";
// import { AuthService } from "./auth.service.js";
// import { AuthGuard } from "./auth.guard.js";

// @Module({
//   controllers: [AuthController],
//   providers: [AuthService, AuthGuard],
//   exports: [AuthService, AuthGuard],
// })
// export class AuthModule {}

import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { AuthGuard } from "./auth.guard.js";

@Module({
  imports: [
    // Fix: Simply import the module directly without calling .forFeature()
    BetterAuthModule,
  ],
  controllers: [],
  providers: [AuthGuard],
  exports: [BetterAuthModule, AuthGuard],
})
export class AuthModule {}
