// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { PrismaClient } from "../generated/prisma/client.js";
// import { Pool } from "pg";
// import { PrismaPg } from "@prisma/adapter-pg";

// // 1. Create a standard industry connection pool using your Neon/PG URL
// const pool = new Pool({ 
//   connectionString: process.env.DATABASE_URL 
// });

// // 2. Instantiate the Prisma PG adapter
// const adapter = new PrismaPg(pool);

// // 3. Pass the adapter options into the required PrismaClient argument
// const prisma = new PrismaClient({ adapter });

// export const auth = betterAuth({
//   database: prismaAdapter(prisma, {
//     provider: "postgresql",
//   }),
//   emailAndPassword: {
//     enabled: true,
//   },
//   session: {
//     expiresIn: 60 * 60 * 24 * 30, // 30 days long session
//     updateAge: 60 * 60 * 2,      // Update session expiration every 2 hours
//   },
//   user: {
//     additionalFields: {
//       location: {
//         type: "string",
//         required: false,
//       },
//     },
//   },
// });

// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { PrismaClient } from "../generated/prisma/client.js";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
// import env from "dotenv";

// env.config();

// const clientPrefix = process.env.CLIENT_PREFIX || "/api/v1";

// // Persistent TCP Pool to prevent WebSocket drops during idle connection periods
// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL!,
// });

// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// export const auth = betterAuth({
//   database: prismaAdapter(prisma, {
//     provider: "postgresql",
//   }),
//   basePath: `${clientPrefix}/auth`,
//   trustedOrigins: [
//     process.env.CLIENT_URL || "http://localhost:5173",
//     "http://localhost:3000",
//     "http://localhost:3001",
//   ],
//   emailAndPassword: {
//     enabled: true,
//   },
//   session: {
//     expiresIn: 60 * 60 * 24 * 30, // 30 days
//     updateAge: 60 * 60 * 2,       // 2 hours
//   },
//   user: {
//     additionalFields: {
//       location: {
//         type: "string",
//         required: false,
//       },
//     },
//   },
// });


// auth.ts
// auth.ts
import "dotenv/config"
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma/client.js"; 
import { getAllowedOrigins } from "../util/allowed-origins.js";
import { isProductionEnv } from "../util/env.js";

// Fix: Wrap the setup inside a factory function
export const getAuthConfig = (prismaInstance: PrismaClient) => betterAuth({
  database: prismaAdapter(prismaInstance, {
    provider: "postgresql",
  }),
  basePath: `${process.env.CLIENT_PREFIX || "/api/v1"}/auth`,
  trustedOrigins: Array.from(
    new Set([
      process.env.CLIENT_URL || "http://localhost:5173",
      ...getAllowedOrigins(),
    ]),
  ),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 2,
  },
  // In production the SPA (e.g. *.vercel.app) calls this API (e.g. *.onrender.com)
  // from a different site, so the session cookie must be SameSite=None; Secure to
  // be sent on cross-origin XHR. Localhost is same-site, so dev keeps default Lax.
  ...(isProductionEnv()
    ? {
        advanced: {
          useSecureCookies: true,
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
  user: {
    additionalFields: {
      location: {
        type: "string",
        required: false,
      },
    },
  },
});

// Create a safe type reference to export downstream for guards
export type AuthInstance = ReturnType<typeof getAuthConfig>;
