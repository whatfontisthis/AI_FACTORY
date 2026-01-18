export interface KoreanRegion {
  name_ko: string;
  name_en?: string;
  province: string;
  province_en?: string;
  latitude: number;
  longitude: number;
  region_type: 'special_city' | 'metropolitan_city' | 'province' | 'city' | 'district' | 'county';
  population?: number;
  area_sqkm?: number;
}

export const koreanRegions: KoreanRegion[] = [
  // Special Cities (특별시)
  {
    name_ko: '서울특별시',
    name_en: 'Seoul',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5665,
    longitude: 126.9780,
    region_type: 'special_city',
    population: 9742617,
    area_sqkm: 605.2
  },
  
  // Metropolitan Cities (광역시)
  {
    name_ko: '부산광역시',
    name_en: 'Busan',
    province: '부산광역시',
    province_en: 'Busan',
    latitude: 35.1796,
    longitude: 129.0756,
    region_type: 'metropolitan_city',
    population: 3405625,
    area_sqkm: 769.9
  },
  {
    name_ko: '대구광역시',
    name_en: 'Daegu',
    province: '대구광역시',
    province_en: 'Daegu',
    latitude: 35.8722,
    longitude: 128.6014,
    region_type: 'metropolitan_city',
    population: 2445741,
    area_sqkm: 883.5
  },
  {
    name_ko: '인천광역시',
    name_en: 'Incheon',
    province: '인천광역시',
    province_en: 'Incheon',
    latitude: 37.4563,
    longitude: 126.7052,
    region_type: 'metropolitan_city',
    population: 2958615,
    area_sqkm: 1062.6
  },
  {
    name_ko: '광주광역시',
    name_en: 'Gwangju',
    province: '광주광역시',
    province_en: 'Gwangju',
    latitude: 35.1595,
    longitude: 126.8526,
    region_type: 'metropolitan_city',
    population: 1457762,
    area_sqkm: 501.2
  },
  {
    name_ko: '대전광역시',
    name_en: 'Daejeon',
    province: '대전광역시',
    province_en: 'Daejeon',
    latitude: 36.3504,
    longitude: 127.3845,
    region_type: 'metropolitan_city',
    population: 1454678,
    area_sqkm: 539.8
  },
  {
    name_ko: '울산광역시',
    name_en: 'Ulsan',
    province: '울산광역시',
    province_en: 'Ulsan',
    latitude: 35.5394,
    longitude: 129.3114,
    region_type: 'metropolitan_city',
    population: 1137260,
    area_sqkm: 1061.5
  },
  {
    name_ko: '세종특별자치시',
    name_en: 'Sejong',
    province: '세종특별자치시',
    province_en: 'Sejong',
    latitude: 36.4801,
    longitude: 127.2887,
    region_type: 'special_city',
    population: 704186,
    area_sqkm: 464.9
  },

  // Major Cities (주요 도시)
  {
    name_ko: '수원시',
    name_en: 'Suwon',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.2634,
    longitude: 127.0286,
    region_type: 'city',
    population: 1241930,
    area_sqkm: 121.1
  },
  {
    name_ko: '성남시',
    name_en: 'Seongnam',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.4386,
    longitude: 127.1378,
    region_type: 'city',
    population: 948757,
    area_sqkm: 141.7
  },
  {
    name_ko: '용인시',
    name_en: 'Yongin',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.2411,
    longitude: 127.2055,
    region_type: 'city',
    population: 1076052,
    area_sqkm: 591.3
  },
  {
    name_ko: '고양시',
    name_en: 'Goyang',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.6584,
    longitude: 126.8320,
    region_type: 'city',
    population: 1085685,
    area_sqkm: 267.3
  },
  {
    name_ko: '안산시',
    name_en: 'Ansan',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.3219,
    longitude: 126.8309,
    region_type: 'city',
    population: 712869,
    area_sqkm: 149.6
  },
  {
    name_ko: '천안시',
    name_en: 'Cheonan',
    province: '충청남도',
    province_en: 'Chungcheongnam-do',
    latitude: 36.8150,
    longitude: 127.1139,
    region_type: 'city',
    population: 664489,
    area_sqkm: 636.2
  },
  {
    name_ko: '청주시',
    name_en: 'Cheongju',
    province: '충청북도',
    province_en: 'Chungcheongbuk-do',
    latitude: 36.6424,
    longitude: 127.4889,
    region_type: 'city',
    population: 848767,
    area_sqkm: 153.9
  },
  {
    name_ko: '전주시',
    name_en: 'Jeonju',
    province: '전라북도',
    province_en: 'Jeollabuk-do',
    latitude: 35.8219,
    longitude: 127.1479,
    region_type: 'city',
    population: 652712,
    area_sqkm: 205.3
  },
  {
    name_ko: '포항시',
    name_en: 'Pohang',
    province: '경상북도',
    province_en: 'Gyeongsangbuk-do',
    latitude: 36.0322,
    longitude: 129.3655,
    region_type: 'city',
    population: 503382,
    area_sqkm: 1127.6
  },
  {
    name_ko: '창원시',
    name_en: 'Changwon',
    province: '경상남도',
    province_en: 'Gyeongsangnam-do',
    latitude: 35.2286,
    longitude: 128.6811,
    region_type: 'city',
    population: 1053428,
    area_sqkm: 747.9
  },

  // Popular Districts (인기 구/지역)
  {
    name_ko: '강남구',
    name_en: 'Gangnam-gu',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5172,
    longitude: 127.0473,
    region_type: 'district',
    population: 548845,
    area_sqkm: 39.5
  },
  {
    name_ko: '종로구',
    name_en: 'Jongno-gu',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5700,
    longitude: 126.9769,
    region_type: 'district',
    population: 157991,
    area_sqkm: 23.8
  },
  {
    name_ko: '마포구',
    name_en: 'Mapo-gu',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5663,
    longitude: 126.9016,
    region_type: 'district',
    population: 383882,
    area_sqkm: 23.9
  },
  {
    name_ko: '홍대',
    name_en: 'Hongdae',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5568,
    longitude: 126.9238,
    region_type: 'district'
  },
  {
    name_ko: '명동',
    name_en: 'Myeongdong',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5636,
    longitude: 126.9834,
    region_type: 'district'
  },
  {
    name_ko: '이태원',
    name_en: 'Itaewon',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5344,
    longitude: 126.9940,
    region_type: 'district'
  },
  {
    name_ko: '해운대구',
    name_en: 'Haeundae-gu',
    province: '부산광역시',
    province_en: 'Busan',
    latitude: 35.1796,
    longitude: 129.1625,
    region_type: 'district',
    population: 434407,
    area_sqkm: 51.4
  },
  {
    name_ko: '서구',
    name_en: 'Seo-gu',
    province: '대전광역시',
    province_en: 'Daejeon',
    latitude: 36.3214,
    longitude: 127.3768,
    region_type: 'district',
    population: 389635,
    area_sqkm: 95.4
  },

  // Provinces (도)
  {
    name_ko: '경기도',
    name_en: 'Gyeonggi-do',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.4138,
    longitude: 127.5183,
    region_type: 'province',
    population: 13629723,
    area_sqkm: 10183.4
  },
  {
    name_ko: '강원도',
    name_en: 'Gangwon-do',
    province: '강원도',
    province_en: 'Gangwon-do',
    latitude: 37.5558,
    longitude: 128.2093,
    region_type: 'province',
    population: 1542125,
    area_sqkm: 16873.3
  },
  {
    name_ko: '충청북도',
    name_en: 'Chungcheongbuk-do',
    province: '충청북도',
    province_en: 'Chungcheongbuk-do',
    latitude: 36.6358,
    longitude: 127.4913,
    region_type: 'province',
    population: 1595271,
    area_sqkm: 7432.1
  },
  {
    name_ko: '충청남도',
    name_en: 'Chungcheongnam-do',
    province: '충청남도',
    province_en: 'Chungcheongnam-do',
    latitude: 36.6588,
    longitude: 126.6728,
    region_type: 'province',
    population: 2145272,
    area_sqkm: 8246.2
  },
  {
    name_ko: '전라북도',
    name_en: 'Jeollabuk-do',
    province: '전라북도',
    province_en: 'Jeollabuk-do',
    latitude: 35.8192,
    longitude: 127.1476,
    region_type: 'province',
    population: 1796038,
    area_sqkm: 8069.4
  },
  {
    name_ko: '전라남도',
    name_en: 'Jeollanam-do',
    province: '전라남도',
    province_en: 'Jeollanam-do',
    latitude: 34.8679,
    longitude: 126.9910,
    region_type: 'province',
    population: 1840460,
    area_sqkm: 12332.8
  },
  {
    name_ko: '경상북도',
    name_en: 'Gyeongsangbuk-do',
    province: '경상북도',
    province_en: 'Gyeongsangbuk-do',
    latitude: 36.5764,
    longitude: 128.5056,
    region_type: 'province',
    population: 2628893,
    area_sqkm: 19030.7
  },
  {
    name_ko: '경상남도',
    name_en: 'Gyeongsangnam-do',
    province: '경상남도',
    province_en: 'Gyeongsangnam-do',
    latitude: 35.2384,
    longitude: 128.6919,
    region_type: 'province',
    population: 3357215,
    area_sqkm: 10532.8
  },
  {
    name_ko: '제주특별자치도',
    name_en: 'Jeju',
    province: '제주특별자치도',
    province_en: 'Jeju',
    latitude: 33.4996,
    longitude: 126.5312,
    region_type: 'province',
    population: 675468,
    area_sqkm: 1849.2
  },

  // Popular Tourist Areas (관광지)
  {
    name_ko: '제주시',
    name_en: 'Jeju City',
    province: '제주특별자치도',
    province_en: 'Jeju',
    latitude: 33.5141,
    longitude: 126.5297,
    region_type: 'city',
    population: 495321,
    area_sqkm: 977.8
  },
  {
    name_ko: '서귀포시',
    name_en: 'Seogwipo',
    province: '제주특별자치도',
    province_en: 'Jeju',
    latitude: 33.2541,
    longitude: 126.5608,
    region_type: 'city',
    population: 180147,
    area_sqkm: 871.4
  },

  // Major Cities Continued
  {
    name_ko: '남양주시',
    name_en: 'Namyangju',
    province: '경기도',
    province_en: 'Gyeonggi-do',
    latitude: 37.6351,
    longitude: 127.2147,
    region_type: 'city',
    population: 736712,
    area_sqkm: 458.0
  },
  {
    name_ko: '부평구',
    name_en: 'Bupyeong-gu',
    province: '인천광역시',
    province_en: 'Incheon',
    latitude: 37.4939,
    longitude: 126.7225,
    region_type: 'district',
    population: 845511,
    area_sqkm: 31.9
  },
  {
    name_ko: '중구',
    name_en: 'Jung-gu',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5638,
    longitude: 126.9976,
    region_type: 'district',
    population: 126766,
    area_sqkm: 9.9
  },
  {
    name_ko: '영등포구',
    name_en: 'Yeongdeungpo-gu',
    province: '서울특별시',
    province_en: 'Seoul',
    latitude: 37.5264,
    longitude: 126.8967,
    region_type: 'district',
    population: 368311,
    area_sqkm: 24.4
  }
];