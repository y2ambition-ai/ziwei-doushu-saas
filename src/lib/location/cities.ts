/**
 * Major China city coordinates.
 * Used for true solar time calculations.
 */

export interface City {
  name: string;
  province: string;
  longitude: number;
  latitude: number;
}

// Major China city coordinates
export const CITIES: City[] = [
  // Municipalities
  { name: 'Beijing', province: 'Beijing', longitude: 116.4074, latitude: 39.9042 },
  { name: 'Shanghai', province: 'Shanghai', longitude: 121.4737, latitude: 31.2304 },
  { name: 'Tianjin', province: 'Tianjin', longitude: 117.1901, latitude: 39.1255 },
  { name: 'Chongqing', province: 'Chongqing', longitude: 106.5516, latitude: 29.563 },

  // Guangdong
  { name: 'Guangzhou', province: 'Guangdong', longitude: 113.2644, latitude: 23.1291 },
  { name: 'Shenzhen', province: 'Guangdong', longitude: 114.0579, latitude: 22.5431 },
  { name: 'Zhuhai', province: 'Guangdong', longitude: 113.5539, latitude: 22.2245 },
  { name: 'Dongguan', province: 'Guangdong', longitude: 113.7463, latitude: 23.046 },
  { name: 'Foshan', province: 'Guangdong', longitude: 113.1227, latitude: 23.0288 },
  { name: 'Zhongshan', province: 'Guangdong', longitude: 113.3926, latitude: 22.5176 },
  { name: 'Huizhou', province: 'Guangdong', longitude: 114.4126, latitude: 23.0794 },
  { name: 'Shantou', province: 'Guangdong', longitude: 116.682, latitude: 23.3535 },
  { name: 'Zhanjiang', province: 'Guangdong', longitude: 110.3649, latitude: 21.2749 },

  // Jiangsu
  { name: 'Nanjing', province: 'Jiangsu', longitude: 118.7969, latitude: 32.0603 },
  { name: 'Suzhou', province: 'Jiangsu', longitude: 120.5853, latitude: 31.2994 },
  { name: 'Wuxi', province: 'Jiangsu', longitude: 120.3119, latitude: 31.4912 },
  { name: 'Changzhou', province: 'Jiangsu', longitude: 119.9742, latitude: 31.8112 },
  { name: 'Nantong', province: 'Jiangsu', longitude: 120.8943, latitude: 31.9802 },
  { name: 'Yangzhou', province: 'Jiangsu', longitude: 119.4213, latitude: 32.3932 },
  { name: 'Xuzhou', province: 'Jiangsu', longitude: 117.1848, latitude: 34.261 },

  // Zhejiang
  { name: 'Hangzhou', province: 'Zhejiang', longitude: 120.1551, latitude: 30.2741 },
  { name: 'Ningbo', province: 'Zhejiang', longitude: 121.544, latitude: 29.8683 },
  { name: 'Wenzhou', province: 'Zhejiang', longitude: 120.6993, latitude: 28.0016 },
  { name: 'Jiaxing', province: 'Zhejiang', longitude: 120.7509, latitude: 30.7627 },
  { name: 'Shaoxing', province: 'Zhejiang', longitude: 120.5821, latitude: 30.0166 },
  { name: 'Jinhua', province: 'Zhejiang', longitude: 119.6495, latitude: 29.0895 },
  { name: 'Taizhou', province: 'Zhejiang', longitude: 121.4286, latitude: 28.6614 },

  // Shandong
  { name: 'Jinan', province: 'Shandong', longitude: 117.0009, latitude: 36.6758 },
  { name: 'Qingdao', province: 'Shandong', longitude: 120.3826, latitude: 36.0671 },
  { name: 'Yantai', province: 'Shandong', longitude: 121.4479, latitude: 37.4638 },
  { name: 'Weifang', province: 'Shandong', longitude: 119.1619, latitude: 36.7068 },
  { name: 'Weihai', province: 'Shandong', longitude: 122.1217, latitude: 37.5132 },
  { name: 'Linyi', province: 'Shandong', longitude: 118.3564, latitude: 35.1047 },

  // Sichuan
  { name: 'Chengdu', province: 'Sichuan', longitude: 104.0657, latitude: 30.6595 },
  { name: 'Mianyang', province: 'Sichuan', longitude: 104.7417, latitude: 31.464 },
  { name: 'Deyang', province: 'Sichuan', longitude: 104.3979, latitude: 31.1269 },
  { name: 'Yibin', province: 'Sichuan', longitude: 104.643, latitude: 28.7518 },
  { name: 'Luzhou', province: 'Sichuan', longitude: 105.4423, latitude: 28.8718 },

  // Hubei
  { name: 'Wuhan', province: 'Hubei', longitude: 114.3052, latitude: 30.5931 },
  { name: 'Yichang', province: 'Hubei', longitude: 111.2865, latitude: 30.6919 },
  { name: 'Xiangyang', province: 'Hubei', longitude: 112.1226, latitude: 32.0089 },
  { name: 'Jingzhou', province: 'Hubei', longitude: 112.2403, latitude: 30.3268 },

  // Hunan
  { name: 'Changsha', province: 'Hunan', longitude: 112.9388, latitude: 28.2282 },
  { name: 'Zhuzhou', province: 'Hunan', longitude: 113.1339, latitude: 27.8274 },
  { name: 'Xiangtan', province: 'Hunan', longitude: 112.944, latitude: 27.8297 },
  { name: 'Hengyang', province: 'Hunan', longitude: 112.572, latitude: 26.8933 },

  // Henan
  { name: 'Zhengzhou', province: 'Henan', longitude: 113.6254, latitude: 34.7466 },
  { name: 'Luoyang', province: 'Henan', longitude: 112.454, latitude: 34.6197 },
  { name: 'Kaifeng', province: 'Henan', longitude: 114.3074, latitude: 35.0922 },
  { name: 'Xinxiang', province: 'Henan', longitude: 113.9268, latitude: 35.303 },

  // Hebei
  { name: 'Shijiazhuang', province: 'Hebei', longitude: 114.5149, latitude: 38.0428 },
  { name: 'Tangshan', province: 'Hebei', longitude: 118.1802, latitude: 39.6305 },
  { name: 'Baoding', province: 'Hebei', longitude: 115.4648, latitude: 38.8739 },
  { name: 'Handan', province: 'Hebei', longitude: 114.5391, latitude: 36.6256 },

  // Fujian
  { name: 'Fuzhou', province: 'Fujian', longitude: 119.3062, latitude: 26.0753 },
  { name: 'Xiamen', province: 'Fujian', longitude: 118.0894, latitude: 24.4798 },
  { name: 'Quanzhou', province: 'Fujian', longitude: 118.6754, latitude: 24.8741 },
  { name: 'Zhangzhou', province: 'Fujian', longitude: 117.6762, latitude: 24.5171 },

  // Shaanxi
  { name: 'Xian', province: 'Shaanxi', longitude: 108.9402, latitude: 34.3416 },
  { name: 'Xianyang', province: 'Shaanxi', longitude: 108.7055, latitude: 34.3296 },
  { name: 'Baoji', province: 'Shaanxi', longitude: 107.1707, latitude: 34.364 },

  // Liaoning
  { name: 'Shenyang', province: 'Liaoning', longitude: 123.4291, latitude: 41.7968 },
  { name: 'Dalian', province: 'Liaoning', longitude: 121.6147, latitude: 38.914 },
  { name: 'Anshan', province: 'Liaoning', longitude: 122.9946, latitude: 41.1089 },

  // Jilin
  { name: 'Changchun', province: 'Jilin', longitude: 125.3245, latitude: 43.8868 },
  { name: 'Jilin', province: 'Jilin', longitude: 126.5496, latitude: 43.8378 },

  // Heilongjiang
  { name: 'Harbin', province: 'Heilongjiang', longitude: 126.6424, latitude: 45.7569 },
  { name: 'Qiqihar', province: 'Heilongjiang', longitude: 123.918, latitude: 47.3543 },
  { name: 'Daqing', province: 'Heilongjiang', longitude: 125.1129, latitude: 46.5886 },

  // Anhui
  { name: 'Hefei', province: 'Anhui', longitude: 117.2272, latitude: 31.8206 },
  { name: 'Wuhu', province: 'Anhui', longitude: 118.4331, latitude: 31.3525 },
  { name: 'Bengbu', province: 'Anhui', longitude: 117.389, latitude: 33.9186 },

  // Jiangxi
  { name: 'Nanchang', province: 'Jiangxi', longitude: 115.8581, latitude: 28.6832 },
  { name: 'Jiujiang', province: 'Jiangxi', longitude: 115.9928, latitude: 29.7121 },
  { name: 'Ganzhou', province: 'Jiangxi', longitude: 114.9354, latitude: 25.8313 },

  // Shanxi
  { name: 'Taiyuan', province: 'Shanxi', longitude: 112.5489, latitude: 37.8706 },
  { name: 'Datong', province: 'Shanxi', longitude: 113.3001, latitude: 40.0769 },

  // Inner Mongolia
  { name: 'Hohhot', province: 'Inner Mongolia', longitude: 111.7515, latitude: 40.8427 },
  { name: 'Baotou', province: 'Inner Mongolia', longitude: 109.8403, latitude: 40.6572 },
  { name: 'Ordos', province: 'Inner Mongolia', longitude: 109.7809, latitude: 39.6086 },

  // Guangxi
  { name: 'Nanning', province: 'Guangxi', longitude: 108.32, latitude: 22.824 },
  { name: 'Guilin', province: 'Guangxi', longitude: 110.1799, latitude: 25.2345 },
  { name: 'Liuzhou', province: 'Guangxi', longitude: 109.4286, latitude: 24.3263 },

  // Yunnan
  { name: 'Kunming', province: 'Yunnan', longitude: 102.8329, latitude: 24.8801 },
  { name: 'Dali', province: 'Yunnan', longitude: 100.225, latitude: 25.5894 },
  { name: 'Lijiang', province: 'Yunnan', longitude: 100.2299, latitude: 26.8589 },

  // Guizhou
  { name: 'Guiyang', province: 'Guizhou', longitude: 106.7135, latitude: 26.5783 },
  { name: 'Zunyi', province: 'Guizhou', longitude: 106.9373, latitude: 27.7066 },

  // Hainan
  { name: 'Haikou', province: 'Hainan', longitude: 110.1999, latitude: 20.044 },
  { name: 'Sanya', province: 'Hainan', longitude: 109.5082, latitude: 18.2479 },

  // Gansu
  { name: 'Lanzhou', province: 'Gansu', longitude: 103.8343, latitude: 36.0611 },
  { name: 'Tianshui', province: 'Gansu', longitude: 105.7249, latitude: 34.5809 },

  // Qinghai
  { name: 'Xining', province: 'Qinghai', longitude: 101.7782, latitude: 36.6171 },

  // Ningxia
  { name: 'Yinchuan', province: 'Ningxia', longitude: 106.2782, latitude: 38.4664 },

  // Xinjiang
  { name: 'Urumqi', province: 'Xinjiang', longitude: 87.6177, latitude: 43.7928 },
  { name: 'Kashgar', province: 'Xinjiang', longitude: 75.9891, latitude: 39.4677 },

  // Tibet
  { name: 'Lhasa', province: 'Tibet', longitude: 91.1322, latitude: 29.66 },

  // Hong Kong, Macau, Taiwan
  { name: 'Hong Kong', province: 'Hong Kong', longitude: 114.1694, latitude: 22.3193 },
  { name: 'Macau', province: 'Macau', longitude: 113.5439, latitude: 22.2006 },
  { name: 'Taipei', province: 'Taiwan', longitude: 121.5654, latitude: 25.033 },
  { name: 'Kaohsiung', province: 'Taiwan', longitude: 120.3119, latitude: 22.6273 },
  { name: 'Taichung', province: 'Taiwan', longitude: 120.679, latitude: 24.1386 },
];

const NORMALIZE_REGEX = /[\s'-]+/g;

function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(NORMALIZE_REGEX, '');
}

/**
 * Search cities by name or province.
 * @param query Search keyword.
 * @param limit Max number of results.
 */
export function searchCities(query: string, limit: number = 10): City[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return CITIES.slice(0, limit);
  }

  const lowerQuery = trimmed.toLowerCase();
  const normalizedQuery = normalizeSearch(trimmed);

  return CITIES.filter((city) => {
    const name = city.name.toLowerCase();
    const province = city.province.toLowerCase();
    const normalizedName = normalizeSearch(city.name);
    const normalizedProvince = normalizeSearch(city.province);

    return (
      name.includes(lowerQuery) ||
      province.includes(lowerQuery) ||
      normalizedName.includes(normalizedQuery) ||
      normalizedProvince.includes(normalizedQuery)
    );
  }).slice(0, limit);
}

/**
 * Get a city by name.
 * @param name City name.
 */
export function getCityByName(name: string): City | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return undefined;
  }

  const lower = trimmed.toLowerCase();
  const normalized = normalizeSearch(trimmed);

  return CITIES.find((city) => {
    const cityName = city.name.toLowerCase();
    return cityName === lower || normalizeSearch(city.name) === normalized;
  });
}
