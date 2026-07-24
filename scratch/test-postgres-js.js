const postgres = require('postgres');

const connectionString = "postgres://postgres:yu-_mUXjS5xQgx7@db.dndgidolcgoaisyzeqqd.supabase.co:5432/postgres?sslmode=require";

async function test1() {
  console.log("Testing without SSL config options...");
  try {
    const sql = postgres(connectionString, { prepare: false });
    const result = await sql`SELECT NOW()`;
    console.log("Success! result:", result);
    await sql.end();
  } catch (err) {
    console.error("Failed without SSL config options:", err);
  }
}

async function test2() {
  console.log("Testing with ssl: 'require' option...");
  try {
    const sql = postgres(connectionString, { prepare: false, ssl: 'require' });
    const result = await sql`SELECT NOW()`;
    console.log("Success with ssl: 'require' option! result:", result);
    await sql.end();
  } catch (err) {
    console.error("Failed with ssl: 'require' option:", err);
  }
}

async function test3() {
  console.log("Testing with ssl: { rejectUnauthorized: false } option...");
  try {
    const sql = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });
    const result = await sql`SELECT NOW()`;
    console.log("Success with rejectUnauthorized option! result:", result);
    await sql.end();
  } catch (err) {
    console.error("Failed with rejectUnauthorized option:", err);
  }
}

async function run() {
  await test1();
  await test2();
  await test3();
}

run();
