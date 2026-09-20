import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pgPool: pg.Pool;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL_UNPOOLED;
    
    if (!databaseUrl) {
      throw new Error("Critical Configuration Failure: DATABASE_URL_UNPOOLED environment variable is not set.");
    }
    
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,                        
      idleTimeoutMillis: 15000,       
      connectionTimeoutMillis: 30000, 
      // FIX: Changed to camelCase to match PoolConfig types
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000, 
    });

    pool.on('error', (err: Error) => {
      this.logger.error(`Neon Connection Pool Exception: ${err.message}`);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pgPool = pool;
  }

  async onModuleInit() {
    let retries = 3;
    while (retries > 0) {
      try {
        await this.pgPool.query('SELECT 1');
        await this.$connect();
        this.logger.log('Successfully connected to Neon PostgreSQL Database.');
        break;
      } catch (error: any) { // FIX: Explicitly typed as 'any' to bypass strict unknown evaluation
        retries--;
        this.logger.warn(`Database connection failed. Retries left: ${retries}. Error: ${error?.message || error}`);
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
   
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pgPool.end();
    } catch (error: any) { // FIX: Explicitly typed as 'any' to bypass strict unknown evaluation
      this.logger.error(`Error destroying database pool: ${error?.message || error}`);
    }
  }
}
