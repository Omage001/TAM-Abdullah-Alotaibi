import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "hkhA12780-@",
    database: "secure_scala_chat",
    ssl: false,
  },
});
