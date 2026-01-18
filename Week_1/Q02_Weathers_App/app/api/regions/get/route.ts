import { NextRequest, NextResponse } from 'next/server';
import { dbGet, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const id = searchParams.get('id');
    
    if (!name && !id) {
      return NextResponse.json(
        { error: 'Either "name" or "id" parameter is required' },
        { status: 400 }
      );
    }

    let region;
    
    if (id) {
      region = await dbGet(`
        SELECT 
          id,
          name_ko,
          name_en,
          province,
          province_en,
          latitude,
          longitude,
          region_type,
          population,
          area_sqkm,
          created_at
        FROM regions 
        WHERE id = ?
      `, [parseInt(id)]);
    } else {
      region = await dbGet(`
        SELECT 
          id,
          name_ko,
          name_en,
          province,
          province_en,
          latitude,
          longitude,
          region_type,
          population,
          area_sqkm,
          created_at
        FROM regions 
        WHERE name_ko = ? OR name_en = ?
        ORDER BY 
          CASE 
            WHEN name_ko = ? THEN 1
            ELSE 2
          END ASC
        LIMIT 1
      `, [name, name, name]);
    }

    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: region.id,
        name_ko: region.name_ko,
        name_en: region.name_en,
        province: region.province,
        province_en: region.province_en,
        latitude: region.latitude,
        longitude: region.longitude,
        region_type: region.region_type,
        population: region.population,
        area_sqkm: region.area_sqkm,
        created_at: region.created_at,
        display_name: region.name_ko !== region.province ? 
          `${region.name_ko}, ${region.province}` : 
          region.name_ko
      }
    });

  } catch (error) {
    console.error('Error getting region:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}