import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
const app = express();
const port = 8000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from express server!");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
