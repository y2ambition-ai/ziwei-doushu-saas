/**
 * 中国主要城市经纬度数据库
 * 适用于真太阳时计算
 */

export interface City {
  name: string;
  province: string;
  longitude: number;
  latitude: number;
}

// 中国主要城市经纬度数据
export const CITIES: City[] = [
  // 直辖市
  { name: '北京', province: '北京', longitude: 116.4074, latitude: 39.9042 },
  { name: '上海', province: '上海', longitude: 121.4737, latitude: 31.2304 },
  { name: '天津', province: '天津', longitude: 117.1901, latitude: 39.1255 },
  { name: '重庆', province: '重庆', longitude: 106.5516, latitude: 29.5630 },

  // 广东省
  { name: '广州', province: '广东', longitude: 113.2644, latitude: 23.1291 },
  { name: '深圳', province: '广东', longitude: 114.0579, latitude: 22.5431 },
  { name: '珠海', province: '广东', longitude: 113.5539, latitude: 22.2245 },
  { name: '东莞', province: '广东', longitude: 113.7463, latitude: 23.0460 },
  { name: '佛山', province: '广东', longitude: 113.1227, latitude: 23.0288 },
  { name: '中山', province: '广东', longitude: 113.3926, latitude: 22.5176 },
  { name: '惠州', province: '广东', longitude: 114.4126, latitude: 23.0794 },
  { name: '汕头', province: '广东', longitude: 116.6820, latitude: 23.3535 },
  { name: '湛江', province: '广东', longitude: 110.3649, latitude: 21.2749 },

  // 江苏省
  { name: '南京', province: '江苏', longitude: 118.7969, latitude: 32.0603 },
  { name: '苏州', province: '江苏', longitude: 120.5853, latitude: 31.2994 },
  { name: '无锡', province: '江苏', longitude: 120.3119, latitude: 31.4912 },
  { name: '常州', province: '江苏', longitude: 119.9742, latitude: 31.8112 },
  { name: '南通', province: '江苏', longitude: 120.8943, latitude: 31.9802 },
  { name: '扬州', province: '江苏', longitude: 119.4213, latitude: 32.3932 },
  { name: '徐州', province: '江苏', longitude: 117.1848, latitude: 34.2610 },

  // 浙江省
  { name: '杭州', province: '浙江', longitude: 120.1551, latitude: 30.2741 },
  { name: '宁波', province: '浙江', longitude: 121.5440, latitude: 29.8683 },
  { name: '温州', province: '浙江', longitude: 120.6993, latitude: 28.0016 },
  { name: '嘉兴', province: '浙江', longitude: 120.7509, latitude: 30.7627 },
  { name: '绍兴', province: '浙江', longitude: 120.5821, latitude: 30.0166 },
  { name: '金华', province: '浙江', longitude: 119.6495, latitude: 29.0895 },
  { name: '台州', province: '浙江', longitude: 121.4286, latitude: 28.6614 },

  // 山东省
  { name: '济南', province: '山东', longitude: 117.0009, latitude: 36.6758 },
  { name: '青岛', province: '山东', longitude: 120.3826, latitude: 36.0671 },
  { name: '烟台', province: '山东', longitude: 121.4479, latitude: 37.4638 },
  { name: '潍坊', province: '山东', longitude: 119.1619, latitude: 36.7068 },
  { name: '威海', province: '山东', longitude: 122.1217, latitude: 37.5132 },
  { name: '临沂', province: '山东', longitude: 118.3564, latitude: 35.1047 },

  // 四川省
  { name: '成都', province: '四川', longitude: 104.0657, latitude: 30.6595 },
  { name: '绵阳', province: '四川', longitude: 104.7417, latitude: 31.4640 },
  { name: '德阳', province: '四川', longitude: 104.3979, latitude: 31.1269 },
  { name: '宜宾', province: '四川', longitude: 104.6430, latitude: 28.7518 },
  { name: '泸州', province: '四川', longitude: 105.4423, latitude: 28.8718 },

  // 湖北省
  { name: '武汉', province: '湖北', longitude: 114.3052, latitude: 30.5931 },
  { name: '宜昌', province: '湖北', longitude: 111.2865, latitude: 30.6919 },
  { name: '襄阳', province: '湖北', longitude: 112.1226, latitude: 32.0089 },
  { name: '荆州', province: '湖北', longitude: 112.2403, latitude: 30.3268 },

  // 湖南省
  { name: '长沙', province: '湖南', longitude: 112.9388, latitude: 28.2282 },
  { name: '株洲', province: '湖南', longitude: 113.1339, latitude: 27.8274 },
  { name: '湘潭', province: '湖南', longitude: 112.9440, latitude: 27.8297 },
  { name: '衡阳', province: '湖南', longitude: 112.5720, latitude: 26.8933 },

  // 河南省
  { name: '郑州', province: '河南', longitude: 113.6254, latitude: 34.7466 },
  { name: '洛阳', province: '河南', longitude: 112.4540, latitude: 34.6197 },
  { name: '开封', province: '河南', longitude: 114.3074, latitude: 35.0922 },
  { name: '新乡', province: '河南', longitude: 113.9268, latitude: 35.3030 },

  // 河北省
  { name: '石家庄', province: '河北', longitude: 114.5149, latitude: 38.0428 },
  { name: '唐山', province: '河北', longitude: 118.1802, latitude: 39.6305 },
  { name: '保定', province: '河北', longitude: 115.4648, latitude: 38.8739 },
  { name: '邯郸', province: '河北', longitude: 114.5391, latitude: 36.6256 },

  // 福建省
  { name: '福州', province: '福建', longitude: 119.3062, latitude: 26.0753 },
  { name: '厦门', province: '福建', longitude: 118.0894, latitude: 24.4798 },
  { name: '泉州', province: '福建', longitude: 118.6754, latitude: 24.8741 },
  { name: '漳州', province: '福建', longitude: 117.6762, latitude: 24.5171 },

  // 陕西省
  { name: '西安', province: '陕西', longitude: 108.9402, latitude: 34.3416 },
  { name: '咸阳', province: '陕西', longitude: 108.7055, latitude: 34.3296 },
  { name: '宝鸡', province: '陕西', longitude: 107.1707, latitude: 34.3640 },

  // 辽宁省
  { name: '沈阳', province: '辽宁', longitude: 123.4291, latitude: 41.7968 },
  { name: '大连', province: '辽宁', longitude: 121.6147, latitude: 38.9140 },
  { name: '鞍山', province: '辽宁', longitude: 122.9946, latitude: 41.1089 },

  // 吉林省
  { name: '长春', province: '吉林', longitude: 125.3245, latitude: 43.8868 },
  { name: '吉林', province: '吉林', longitude: 126.5496, latitude: 43.8378 },

  // 黑龙江省
  { name: '哈尔滨', province: '黑龙江', longitude: 126.6424, latitude: 45.7569 },
  { name: '齐齐哈尔', province: '黑龙江', longitude: 123.9180, latitude: 47.3543 },
  { name: '大庆', province: '黑龙江', longitude: 125.1129, latitude: 46.5886 },

  // 安徽省
  { name: '合肥', province: '安徽', longitude: 117.2272, latitude: 31.8206 },
  { name: '芜湖', province: '安徽', longitude: 118.4331, latitude: 31.3525 },
  { name: '蚌埠', province: '安徽', longitude: 117.3890, latitude: 33.9186 },

  // 江西省
  { name: '南昌', province: '江西', longitude: 115.8581, latitude: 28.6832 },
  { name: '九江', province: '江西', longitude: 115.9928, latitude: 29.7121 },
  { name: '赣州', province: '江西', longitude: 114.9354, latitude: 25.8313 },

  // 山西省
  { name: '太原', province: '山西', longitude: 112.5489, latitude: 37.8706 },
  { name: '大同', province: '山西', longitude: 113.3001, latitude: 40.0769 },

  // 内蒙古
  { name: '呼和浩特', province: '内蒙古', longitude: 111.7515, latitude: 40.8427 },
  { name: '包头', province: '内蒙古', longitude: 109.8403, latitude: 40.6572 },
  { name: '鄂尔多斯', province: '内蒙古', longitude: 109.7809, latitude: 39.6086 },

  // 广西
  { name: '南宁', province: '广西', longitude: 108.3200, latitude: 22.8240 },
  { name: '桂林', province: '广西', longitude: 110.1799, latitude: 25.2345 },
  { name: '柳州', province: '广西', longitude: 109.4286, latitude: 24.3263 },

  // 云南省
  { name: '昆明', province: '云南', longitude: 102.8329, latitude: 24.8801 },
  { name: '大理', province: '云南', longitude: 100.2250, latitude: 25.5894 },
  { name: '丽江', province: '云南', longitude: 100.2299, latitude: 26.8589 },

  // 贵州省
  { name: '贵阳', province: '贵州', longitude: 106.7135, latitude: 26.5783 },
  { name: '遵义', province: '贵州', longitude: 106.9373, latitude: 27.7066 },

  // 海南省
  { name: '海口', province: '海南', longitude: 110.1999, latitude: 20.0440 },
  { name: '三亚', province: '海南', longitude: 109.5082, latitude: 18.2479 },

  // 甘肃省
  { name: '兰州', province: '甘肃', longitude: 103.8343, latitude: 36.0611 },
  { name: '天水', province: '甘肃', longitude: 105.7249, latitude: 34.5809 },

  // 青海省
  { name: '西宁', province: '青海', longitude: 101.7782, latitude: 36.6171 },

  // 宁夏
  { name: '银川', province: '宁夏', longitude: 106.2782, latitude: 38.4664 },

  // 新疆
  { name: '乌鲁木齐', province: '新疆', longitude: 87.6177, latitude: 43.7928 },
  { name: '喀什', province: '新疆', longitude: 75.9891, latitude: 39.4677 },

  // 西藏
  { name: '拉萨', province: '西藏', longitude: 91.1322, latitude: 29.6600 },

  // 香港、澳门、台湾
  { name: '香港', province: '香港', longitude: 114.1694, latitude: 22.3193 },
  { name: '澳门', province: '澳门', longitude: 113.5439, latitude: 22.2006 },
  { name: '台北', province: '台湾', longitude: 121.5654, latitude: 25.0330 },
  { name: '高雄', province: '台湾', longitude: 120.3119, latitude: 22.6273 },
  { name: '台中', province: '台湾', longitude: 120.6790, latitude: 24.1386 },
];

/**
 * 搜索城市
 * @param query 搜索关键词
 * @param limit 返回结果数量限制
 */
export function searchCities(query: string, limit: number = 10): City[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return CITIES.slice(0, limit);

  return CITIES
    .filter(city => {
      const nameMatch = city.name.toLowerCase().includes(lowerQuery);
      const provinceMatch = city.province.toLowerCase().includes(lowerQuery);
      const pinyinMatch = getPinyin(city.name).toLowerCase().includes(lowerQuery);
      return nameMatch || provinceMatch || pinyinMatch;
    })
    .slice(0, limit);
}

/**
 * 根据名称获取城市
 * @param name 城市名称
 */
export function getCityByName(name: string): City | undefined {
  return CITIES.find(city => city.name === name);
}

/**
 * 简单的拼音映射（常用城市）
 */
function getPinyin(name: string): string {
  const pinyinMap: Record<string, string> = {
    '北京': 'beijing',
    '上海': 'shanghai',
    '广州': 'guangzhou',
    '深圳': 'shenzhen',
    '杭州': 'hangzhou',
    '南京': 'nanjing',
    '成都': 'chengdu',
    '武汉': 'wuhan',
    '西安': 'xian',
    '重庆': 'chongqing',
    '天津': 'tianjin',
    '苏州': 'suzhou',
    '厦门': 'xiamen',
    '青岛': 'qingdao',
    '大连': 'dalian',
    '宁波': 'ningbo',
    '无锡': 'wuxi',
    '长沙': 'changsha',
    '郑州': 'zhengzhou',
    '沈阳': 'shenyang',
    '哈尔滨': 'haerbin',
    '济南': 'jinan',
    '福州': 'fuzhou',
    '昆明': 'kunming',
    '南宁': 'nanning',
    '合肥': 'hefei',
    '南昌': 'nanchang',
    '贵阳': 'guiyang',
    '兰州': 'lanzhou',
    '海口': 'haikou',
    '三亚': 'sanya',
    '拉萨': 'lasa',
    '乌鲁木齐': 'wulumuqi',
    '呼和浩特': 'huhehaote',
    '银川': 'yinchuan',
    '西宁': 'xining',
    '香港': 'hongkong xianggang',
    '澳门': 'macau aomen',
    '台北': 'taibei',
  };
  return pinyinMap[name] || '';
}
