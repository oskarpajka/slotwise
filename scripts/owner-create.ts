import "dotenv/config";
import { connectDatabase } from "@/db/client";
import { createAuth } from "@/lib/auth/auth";
import { createOwner } from "@/lib/auth/owner";

const { db, pool } = connectDatabase();

try {
  const result = await createOwner(createAuth(db), db, {
    email: process.env.OWNER_EMAIL,
    password: process.env.OWNER_PASSWORD,
  });
  switch (result.status) {
    case "created":
      console.log("Owner created. Remove OWNER_PASSWORD from .env now.");
      break;
    case "owner_exists":
      console.error("An owner already exists. Nothing was changed.");
      process.exitCode = 1;
      break;
    case "invalid":
      console.error("Check OWNER_EMAIL and OWNER_PASSWORD:");
      for (const issue of result.issues) console.error(`  ${issue}`);
      process.exitCode = 1;
      break;
  }
} finally {
  await pool.end();
}
