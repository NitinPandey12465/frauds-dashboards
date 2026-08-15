import "dotenv/config";
import { runSeed } from "../src/lib/seed-data";

runSeed({ truncate: true })
  .then((count) => {
    console.log(`Seed complete. ${count} transactions now in the database.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
