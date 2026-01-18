import { NextRequest, NextResponse } from 'next/server';
import { dbAll, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.trim().length < 1) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required and must be at least 1 character' },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();
    
    const regions = await dbAll(`
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
        CASE
          WHEN name_ko LIKE ? THEN 1
          WHEN name_ko LIKE ? THEN 2
          WHEN name_en LIKE ? THEN 3
          WHEN name_en LIKE ? THEN 4
          WHEN province LIKE ? THEN 5
          ELSE 6
        END as relevance_score
      FROM regions 
      WHERE (
        name_ko LIKE ? OR 
        name_en LIKE ? OR 
        province LIKE ? OR
        province_en LIKE ?
      )
      ORDER BY relevance_score ASC, 
               CASE 
                 WHEN region_type = 'special_city' THEN 1
                 WHEN region_type = 'metropolitan_city' THEN 2
                 WHEN region_type = 'city' THEN 3
                 WHEN region_type = 'district' THEN 4
                 ELSE 5
               END ASC,
               population DESC NULLS LAST
      LIMIT ?
    `, [
      `${searchQuery}%`, // Exact match at start
      `%${searchQuery}%`, // Contains match
      `${searchQuery}%`, // English exact match at start
      `%${searchQuery}%`, // English contains match
      `%${searchQuery}%`, // Province contains match
      `%${searchQuery}%`, // Name contains
      `%${searchQuery}%`, // English name contains
      `%${searchQuery}%`, // Province contains
      `%${searchQuery}%`, // English province contains
      limit
    ]);

    return NextResponse.json({
      success: true,
      query: searchQuery,
      count: regions.length,
      data: regions.map(region => ({
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
        display_name: region.name_ko !== region.province ? 
          `${region.name_ko}, ${region.province}` : 
          region.name_ko
      }))
    });

  } catch (error) {
    console.error('Error in regions search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}