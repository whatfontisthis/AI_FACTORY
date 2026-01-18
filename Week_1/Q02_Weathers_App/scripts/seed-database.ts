#!/usr/bin/env node

import { initializeDatabase, dbRun, closeDatabase } from '../lib/database';
import { koreanRegions } from '../data/korean-regions';

async function seedDatabase() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    console.log('Clearing existing data...');
    await dbRun('DELETE FROM regions');

    console.log('Seeding Korean regions data...');
    for (const region of koreanRegions) {
      await dbRun(`
        INSERT INTO regions (
          name_ko, name_en, province, province_en, latitude, longitude, 
          region_type, population, area_sqkm
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        region.name_ko,
        region.name_en || null,
        region.province,
        region.province_en || null,
        region.latitude,
        region.longitude,
        region.region_type,
        region.population || null,
        region.area_sqkm || null
      ]);
    }

    console.log(`Successfully seeded ${koreanRegions.length} Korean regions`);
    
    const count = await dbRun('SELECT COUNT(*) as count FROM regions');
    console.log(`Total regions in database: ${count}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };