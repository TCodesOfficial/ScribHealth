// import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
// import { PrismaClient } from "../generated/prisma/client.js";
// import { PrismaNeon } from "@prisma/adapter-neon";

// /* eslint-disable @typescript-eslint/no-explicit-any */

// @Injectable()
// export class PrismaService implements OnModuleInit, OnModuleDestroy {
//   private readonly client: any;

//   constructor() {
//     const adapter = new PrismaNeon({
//       connectionString: process.env.DATABASE_URL!,
//     });
//     this.client = new PrismaClient({ adapter });
//   }

//   get user() {
//     return this.client.user as any;
//   }

//   get session() {
//     return this.client.session as any;
//   }

//   get account() {
//     return this.client.account as any;
//   }

//   get verification() {
//     return this.client.verification as any;
//   }

//   get patientConsultation() {
//     return this.client.patientConsultation as any;
//   }

//   async onModuleInit() {
//     await this.client.$connect();
//   }

//   async onModuleDestroy() {
//     await this.client.$disconnect();
//   }
// }


import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: any;

  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({ adapter });
  }

  get user() {
    return this.client.user as any;
  }

  get session() {
    return this.client.session as any;
  }

  get account() {
    return this.client.account as any;
  }

  get verification() {
    return this.client.verification as any;
  }

  get patientConsultation() {
    return this.client.patientConsultation as any;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}