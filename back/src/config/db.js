const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const argon2 = require("argon2");

// En dev: dotenv charge le .env (via server.js)
// En prod Docker: les variables viennent du docker-compose.yml

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "batasite2",
  user: process.env.DB_USER || "batasite2",
  password: process.env.DB_PASSWORD || "changeme",
});

/* ----------------------------------
   Test DB
---------------------------------- */
const testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✓ Database connection successful");
  } catch (err) {
    console.error("✗ Database connection error", err);
    throw err;
  }
};

/* ----------------------------------
   Init DB (tables)
---------------------------------- */
const initDb = async () => {
  await testConnection();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'superadmin')),
      is_active BOOLEAN DEFAULT true,
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✓ Admins table ensured");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site (
      id SERIAL PRIMARY KEY,
      meta JSONB NOT NULL,
      theme JSONB NOT NULL,
      sections JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✓ Site table ensured");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('image', 'video', 'font')),
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log("✓ Media table ensured");
};

/* ----------------------------------
   Seed Admins
---------------------------------- */
const seedAdmins = async () => {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM admins"
  );

  if (rows[0].count > 0) {
    console.log(`✓ Admins already seeded (${rows[0].count})`);
    return;
  }

  console.log("Seeding default admins...");

  const adminHash = await argon2.hash(process.env.ADMIN_PASSWORD);
  const superAdminHash = await argon2.hash(process.env.SUPER_ADMIN_PASSWORD);

  await pool.query(
    `
    INSERT INTO admins (email, password_hash, role)
    VALUES
      ($1, $2, 'admin'),
      ($3, $4, 'superadmin')
    `,
    [
      process.env.ADMIN_EMAIL,
      adminHash,
      process.env.SUPER_ADMIN_EMAIL,
      superAdminHash,
    ]
  );

  console.log("✓ Default admins seeded");
};

/* ----------------------------------
   Seed Media
---------------------------------- */
const seedMedia = async () => {
  console.log("Seeding media...");

  // Truncate la table media et réinitialise les IDs
  await pool.query("TRUNCATE TABLE media RESTART IDENTITY CASCADE");

  await pool.query(`
    INSERT INTO media (id, type, filename, mime_type)
    VALUES
      (1, 'image', 'logo.gif', 'image/gif'),
      (2, 'image', 'header.svg', 'image/svg+xml'),
      (3, 'image', 'event1.jpg', 'image/jpeg'),
      (4, 'image', 'event2.jpg', 'image/jpeg'),
      (5, 'image', 'event3.jpg', 'image/jpeg'),
      (6, 'image', 'event4.jpg', 'image/jpeg'),
      (7, 'image', 'event5.jpg', 'image/jpeg'),
      (8, 'image', 'event6.jpg', 'image/jpeg'),
      (9, 'image', 'photo1.jpeg', 'image/jpeg'),
      (10, 'image', 'photo2.jpg', 'image/jpeg'),
      (11, 'image', 'photo3.jpg', 'image/jpeg'),
      (12, 'image', 'photo4.jpg', 'image/jpeg'),
      (13, 'image', 'photo5.jpg', 'image/jpeg'),
      (14, 'image', 'photo6.png', 'image/png');
  `);

  // Set sequence to next available ID to avoid conflicts on new uploads
  await pool.query("SELECT setval('media_id_seq', 15, false)");

  console.log("✓ Media seeded with correct IDs");
};



/* ----------------------------------
   Seed Site Content (JSON)
---------------------------------- */
const seedContent = async () => {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM site");

  if (rows[0].count > 0) {
    // Clear existing data
    await pool.query("DELETE FROM site");
    console.log("Cleared existing site data");
  }

  const jsonPath = path.resolve(__dirname, "./data.json");

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  await pool.query(
    `
    INSERT INTO site (meta, theme, sections)
    VALUES ($1::jsonb, $2::jsonb, $3::jsonb)
    `,
    [JSON.stringify(data.meta), JSON.stringify(data.theme), JSON.stringify(data.sections)]
  );

  console.log("✓ Site content seeded");
};

module.exports = {
  pool,
  testConnection,
  initDb,
  seedAdmins,
  seedMedia,
  seedContent,
};
