// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from "@nestjs/common";
// import { fromNodeHeaders } from "better-auth/node";
// import { AuthService } from "./auth.service.js";

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private readonly authService: AuthService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const headers = fromNodeHeaders(request.headers);

//     const session = await this.authService.getSession(headers);

//     if (!session) {
//       throw new UnauthorizedException("Invalid or expired session");
//     }

//     request.user = session.user;
//     request.session = session.session;

//     return true;
//   }
// }


// src/auth/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { getAuthConfig } from "./auth.js"; // Target your factory function reference

@Injectable()
export class AuthGuard implements CanActivate {
  // Fix: Derive generic signatures directly from the factory definition type structure
  constructor(private readonly authService: AuthService<ReturnType<typeof getAuthConfig>>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = fromNodeHeaders(request.headers);

    const session = await this.authService.api.getSession({
      headers,
    });

    if (!session) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    request.user = session.user;
    request.session = session.session;

    return true;
  }
}
