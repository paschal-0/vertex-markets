import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __mainApiPrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__mainApiPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__mainApiPrisma__ = prisma;
}

