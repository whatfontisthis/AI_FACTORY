import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const DB_PATH = './database/weather.db';

export const db = new sqlite3.Database(DB_PATH);

export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

export async function initializeDatabase() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ko TEXT NOT NULL,
        name_en TEXT,
        province TEXT NOT NULL,
        province_en TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        region_type TEXT NOT NULL CHECK (region_type IN ('special_city', 'metropolitan_city', 'province', 'city', 'district', 'county')),
        population INTEGER,
        area_sqkm REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name_ko, province)
      )
    `);

    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_regions_name_ko ON regions(name_ko)
    `);

    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_regions_province ON regions(province)
    `);

    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_regions_coordinates ON regions(latitude, longitude)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function closeDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}