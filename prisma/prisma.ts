import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

// const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {})
export const prisma = new PrismaClient({ adapter });