import { NextRequest, NextResponse } from 'next/server';
import { dbAll, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const province = searchParams.get('province');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let whereClause = '';
    let queryParams: any[] = [];
    
    if (type) {
      whereClause += ' WHERE region_type = ?';
      queryParams.push(type);
    }
    
    if (province) {
      whereClause += whereClause ? ' AND province = ?' : ' WHERE province = ?';
      queryParams.push(province);
    }
    
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
        area_sqkm
      FROM regions 
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN region_type = 'special_city' THEN 1
          WHEN region_type = 'metropolitan_city' THEN 2
          WHEN region_type = 'province' THEN 3
          WHEN region_type = 'city' THEN 4
          WHEN region_type = 'district' THEN 5
          ELSE 6
        END ASC,
        population DESC NULLS LAST,
        name_ko ASC
      LIMIT ?
    `, [...queryParams, limit]);

    const regionCounts = await dbAll(`
      SELECT region_type, COUNT(*) as count
      FROM regions
      GROUP BY region_type
      ORDER BY count DESC
    `);

    const provinceCounts = await dbAll(`
      SELECT province, COUNT(*) as count
      FROM regions
      GROUP BY province
      ORDER BY count DESC
    `);

    return NextResponse.json({
      success: true,
      filters: {
        type,
        province,
        limit
      },
      count: regions.length,
      stats: {
        by_type: regionCounts,
        by_province: provinceCounts
      },
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
    console.error('Error listing regions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}