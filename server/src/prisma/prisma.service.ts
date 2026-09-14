// import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
// import { PrismaClient } from "../generated/prisma/client.js";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
// import "dotenv/config";

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   private pgPool: pg.Pool;

//   constructor() {
//     // Force direct fallback validation to protect the compiler loop
//     const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
    
//     if (!databaseUrl) {
//       throw new Error("Critical Configuration Failure: Neither DATABASE_URL nor DATABASE_URL_UNPOOLED is set.");
//     }

//     // 1. Initialize the standard pg driver pool matching Node's architecture ecosystem
//     const pool = new pg.Pool({ connectionString: databaseUrl });
    
//     // 2. Instantiate the mandatory Prisma 7 Postgres runtime driver adapter
//     const adapter = new PrismaPg(pool);

//     // 3. Pass the adapter block directly into the super constructor config option
//     super({ adapter });
    
//     this.pgPool = pool;
//   }

//   async onModuleInit() {
//     await this.$connect();
//   }
   
//   async onModuleDestroy() {
//     await this.$disconnect();
//     await this.pgPool.end();
//   }
// }

import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";


// process.env.DATABASE_URL || 
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pgPool: pg.Pool;

  constructor() {
    const databaseUrl =process.env.DATABASE_URL_UNPOOLED;
    
    if (!databaseUrl) {
      throw new Error("Critical Configuration Failure: Neither DATABASE_URL nor DATABASE_URL_UNPOOLED environment variables are set.");
    }
    const pool = new pg.Pool({ 
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,                        // Protect Neon connection bounds limits
      idleTimeoutMillis: 30000,       // Recycle idle connection workers after 30 seconds
      connectionTimeoutMillis: 10000, // Allow up to 10 seconds for initial handshakes
    });

    pool.on('error', (err) => {
      console.warn('Neon connection pool worker encountered an idle exception:', err.message);
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
    
    this.pgPool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }
   
  async onModuleDestroy() {
    await this.$disconnect();
    await this.pgPool.end();
  }
}
