// 数据加载模块 — 内嵌数据 + JSON 在线更新双模式
// 本地双击打开时 fetch 可能被浏览器拦截，所以关键数据直接内嵌

const EMBEDDED_DATA = {
  jiangsu: {
    "province": "江苏", "year": 2026,
    "batchLines": { "physics": { "本科": 456, "特招": 513 }, "history": { "本科": 484, "特招": 532 } },
    "schools": [
      { "name": "南京大学", "code": "10284", "type": "985", "city": "南京", "majors": [
        { "name": "人工智能", "category": "工科", "minScore": 678, "avgScore": 681, "minRank": 480, "planCount": 30, "actualCount": 32, "subjectGroup": "physics" },
        { "name": "计算机科学与技术", "category": "工科", "minScore": 675, "avgScore": 678, "minRank": 550, "planCount": 50, "actualCount": 52, "subjectGroup": "physics" },
        { "name": "软件工程", "category": "工科", "minScore": 672, "avgScore": 675, "minRank": 620, "planCount": 45, "actualCount": 46, "subjectGroup": "physics" },
        { "name": "金融学", "category": "经管", "minScore": 668, "avgScore": 671, "minRank": 750, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "法学", "category": "法学", "minScore": 670, "avgScore": 673, "minRank": 680, "planCount": 20, "actualCount": 22, "subjectGroup": "physics" },
        { "name": "汉语言文学", "category": "文学", "minScore": 655, "avgScore": 658, "minRank": 1100, "planCount": 15, "actualCount": 15, "subjectGroup": "history" },
        { "name": "历史学", "category": "文史", "minScore": 650, "avgScore": 653, "minRank": 1300, "planCount": 12, "actualCount": 12, "subjectGroup": "history" },
        { "name": "哲学", "category": "文史", "minScore": 648, "avgScore": 651, "minRank": 1400, "planCount": 10, "actualCount": 10, "subjectGroup": "history" }
      ]},
      { "name": "东南大学", "code": "10286", "type": "985", "city": "南京", "majors": [
        { "name": "电子信息工程", "category": "工科", "minScore": 660, "avgScore": 663, "minRank": 900, "planCount": 40, "actualCount": 42, "subjectGroup": "physics" },
        { "name": "建筑学", "category": "工科", "minScore": 658, "avgScore": 662, "minRank": 980, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "土木工程", "category": "工科", "minScore": 648, "avgScore": 652, "minRank": 1500, "planCount": 35, "actualCount": 36, "subjectGroup": "physics" },
        { "name": "交通运输", "category": "工科", "minScore": 645, "avgScore": 648, "minRank": 1700, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" },
        { "name": "信息与计算科学", "category": "理学", "minScore": 650, "avgScore": 654, "minRank": 1400, "planCount": 15, "actualCount": 16, "subjectGroup": "physics" }
      ]},
      { "name": "南京航空航天大学", "code": "10287", "type": "211", "city": "南京", "majors": [
        { "name": "飞行器设计与工程", "category": "工科", "minScore": 642, "avgScore": 646, "minRank": 2000, "planCount": 60, "actualCount": 62, "subjectGroup": "physics" },
        { "name": "自动化", "category": "工科", "minScore": 638, "avgScore": 641, "minRank": 2400, "planCount": 45, "actualCount": 45, "subjectGroup": "physics" },
        { "name": "计算机科学与技术", "category": "工科", "minScore": 640, "avgScore": 644, "minRank": 2200, "planCount": 50, "actualCount": 53, "subjectGroup": "physics" },
        { "name": "英语", "category": "文学", "minScore": 595, "avgScore": 598, "minRank": 5200, "planCount": 20, "actualCount": 20, "subjectGroup": "history" },
        { "name": "管理科学与工程", "category": "经管", "minScore": 636, "avgScore": 639, "minRank": 2600, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" }
      ]},
      { "name": "南京理工大学", "code": "10288", "type": "211", "city": "南京", "majors": [
        { "name": "兵器科学与技术", "category": "工科", "minScore": 635, "avgScore": 639, "minRank": 2600, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "机械工程", "category": "工科", "minScore": 632, "avgScore": 635, "minRank": 2900, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" },
        { "name": "化学工程与工艺", "category": "工科", "minScore": 628, "avgScore": 631, "minRank": 3300, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "光电信息科学与工程", "category": "工科", "minScore": 633, "avgScore": 637, "minRank": 2800, "planCount": 30, "actualCount": 31, "subjectGroup": "physics" }
      ]},
      { "name": "苏州大学", "code": "10285", "type": "211", "city": "苏州", "majors": [
        { "name": "临床医学", "category": "医学", "minScore": 630, "avgScore": 635, "minRank": 3100, "planCount": 35, "actualCount": 36, "subjectGroup": "physics" },
        { "name": "放射医学", "category": "医学", "minScore": 622, "avgScore": 626, "minRank": 4000, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" },
        { "name": "材料科学与工程", "category": "工科", "minScore": 620, "avgScore": 623, "minRank": 4200, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "法学", "category": "法学", "minScore": 625, "avgScore": 629, "minRank": 3600, "planCount": 25, "actualCount": 26, "subjectGroup": "physics" },
        { "name": "会计学", "category": "经管", "minScore": 610, "avgScore": 614, "minRank": 5600, "planCount": 20, "actualCount": 21, "subjectGroup": "history" },
        { "name": "新闻传播学", "category": "文学", "minScore": 605, "avgScore": 608, "minRank": 6300, "planCount": 15, "actualCount": 15, "subjectGroup": "history" }
      ]},
      { "name": "河海大学", "code": "10294", "type": "211", "city": "南京", "majors": [
        { "name": "水利工程", "category": "工科", "minScore": 618, "avgScore": 622, "minRank": 4500, "planCount": 50, "actualCount": 51, "subjectGroup": "physics" },
        { "name": "环境工程", "category": "工科", "minScore": 612, "avgScore": 615, "minRank": 5200, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "港口航道与海岸工程", "category": "工科", "minScore": 608, "avgScore": 611, "minRank": 5900, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" },
        { "name": "水文与水资源工程", "category": "工科", "minScore": 610, "avgScore": 613, "minRank": 5600, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" }
      ]},
      { "name": "南京师范大学", "code": "10319", "type": "211", "city": "南京", "majors": [
        { "name": "汉语言文学（师范）", "category": "师范", "minScore": 612, "avgScore": 616, "minRank": 5200, "planCount": 40, "actualCount": 42, "subjectGroup": "history" },
        { "name": "英语（师范）", "category": "师范", "minScore": 608, "avgScore": 611, "minRank": 5800, "planCount": 35, "actualCount": 35, "subjectGroup": "history" },
        { "name": "历史学（师范）", "category": "师范", "minScore": 602, "avgScore": 605, "minRank": 6800, "planCount": 25, "actualCount": 25, "subjectGroup": "history" },
        { "name": "数学与应用数学（师范）", "category": "师范", "minScore": 615, "avgScore": 619, "minRank": 4800, "planCount": 45, "actualCount": 46, "subjectGroup": "physics" },
        { "name": "物理学（师范）", "category": "师范", "minScore": 608, "avgScore": 612, "minRank": 5900, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "学前教育", "category": "师范", "minScore": 580, "avgScore": 583, "minRank": 8500, "planCount": 25, "actualCount": 25, "subjectGroup": "history" }
      ]},
      { "name": "中国药科大学", "code": "10316", "type": "211", "city": "南京", "majors": [
        { "name": "药学", "category": "医学", "minScore": 615, "avgScore": 620, "minRank": 4800, "planCount": 60, "actualCount": 62, "subjectGroup": "physics" },
        { "name": "中药学", "category": "医学", "minScore": 605, "avgScore": 608, "minRank": 6300, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "药物制剂", "category": "医学", "minScore": 598, "avgScore": 602, "minRank": 7500, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "临床药学", "category": "医学", "minScore": 608, "avgScore": 612, "minRank": 5900, "planCount": 20, "actualCount": 21, "subjectGroup": "physics" }
      ]},
      { "name": "南京农业大学", "code": "10307", "type": "211", "city": "南京", "majors": [
        { "name": "农学", "category": "农学", "minScore": 590, "avgScore": 594, "minRank": 6800, "planCount": 35, "actualCount": 35, "subjectGroup": "physics" },
        { "name": "动物医学", "category": "农学", "minScore": 585, "avgScore": 589, "minRank": 7800, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "食品科学与工程", "category": "工科", "minScore": 595, "avgScore": 598, "minRank": 6200, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "农林经济管理", "category": "经管", "minScore": 592, "avgScore": 595, "minRank": 6500, "planCount": 15, "actualCount": 15, "subjectGroup": "history" }
      ]},
      { "name": "南京医科大学", "code": "10312", "type": "双一流", "city": "南京", "majors": [
        { "name": "临床医学（5+3一体化）", "category": "医学", "minScore": 640, "avgScore": 645, "minRank": 2200, "planCount": 80, "actualCount": 82, "subjectGroup": "physics" },
        { "name": "口腔医学", "category": "医学", "minScore": 635, "avgScore": 639, "minRank": 2600, "planCount": 25, "actualCount": 26, "subjectGroup": "physics" },
        { "name": "预防医学", "category": "医学", "minScore": 610, "avgScore": 614, "minRank": 5600, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "护理学", "category": "医学", "minScore": 560, "avgScore": 565, "minRank": 14000, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" }
      ]},
      { "name": "南京工业大学", "code": "10291", "type": "公办本科", "city": "南京", "majors": [
        { "name": "化学工程与工艺", "category": "工科", "minScore": 575, "avgScore": 580, "minRank": 9800, "planCount": 55, "actualCount": 56, "subjectGroup": "physics" },
        { "name": "安全工程", "category": "工科", "minScore": 568, "avgScore": 572, "minRank": 11500, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "生物工程", "category": "工科", "minScore": 562, "avgScore": 566, "minRank": 13200, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "法学", "category": "法学", "minScore": 570, "avgScore": 573, "minRank": 10800, "planCount": 20, "actualCount": 20, "subjectGroup": "history" }
      ]},
      { "name": "扬州大学", "code": "11117", "type": "公办本科", "city": "扬州", "majors": [
        { "name": "动物医学", "category": "农学", "minScore": 555, "avgScore": 560, "minRank": 15800, "planCount": 30, "actualCount": 31, "subjectGroup": "physics" },
        { "name": "烹饪与营养教育", "category": "工科", "minScore": 540, "avgScore": 544, "minRank": 22000, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" },
        { "name": "汉语言文学", "category": "文学", "minScore": 558, "avgScore": 562, "minRank": 14800, "planCount": 35, "actualCount": 35, "subjectGroup": "history" },
        { "name": "化学（师范）", "category": "师范", "minScore": 550, "avgScore": 554, "minRank": 18000, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" }
      ]},
      { "name": "江苏大学", "code": "10299", "type": "公办本科", "city": "镇江", "majors": [
        { "name": "车辆工程", "category": "工科", "minScore": 570, "avgScore": 574, "minRank": 10800, "planCount": 40, "actualCount": 41, "subjectGroup": "physics" },
        { "name": "能源与动力工程", "category": "工科", "minScore": 565, "avgScore": 568, "minRank": 12200, "planCount": 35, "actualCount": 35, "subjectGroup": "physics" },
        { "name": "食品科学与工程", "category": "工科", "minScore": 555, "avgScore": 558, "minRank": 15800, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "医学检验技术", "category": "医学", "minScore": 560, "avgScore": 563, "minRank": 14000, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" }
      ]},
      { "name": "南通大学", "code": "10304", "type": "公办本科", "city": "南通", "majors": [
        { "name": "临床医学", "category": "医学", "minScore": 578, "avgScore": 583, "minRank": 9000, "planCount": 50, "actualCount": 51, "subjectGroup": "physics" },
        { "name": "电子信息工程", "category": "工科", "minScore": 550, "avgScore": 554, "minRank": 18000, "planCount": 35, "actualCount": 35, "subjectGroup": "physics" },
        { "name": "小学教育（师范）", "category": "师范", "minScore": 548, "avgScore": 552, "minRank": 18800, "planCount": 30, "actualCount": 30, "subjectGroup": "history" },
        { "name": "护理学", "category": "医学", "minScore": 535, "avgScore": 539, "minRank": 24500, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" }
      ]},
      { "name": "常州大学", "code": "10292", "type": "公办本科", "city": "常州", "majors": [
        { "name": "石油工程", "category": "工科", "minScore": 535, "avgScore": 540, "minRank": 24500, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "高分子材料与工程", "category": "工科", "minScore": 530, "avgScore": 534, "minRank": 26800, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "会计学", "category": "经管", "minScore": 540, "avgScore": 545, "minRank": 22000, "planCount": 20, "actualCount": 20, "subjectGroup": "history" },
        { "name": "计算机科学与技术", "category": "工科", "minScore": 545, "avgScore": 549, "minRank": 19500, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" }
      ]},
      { "name": "江苏师范大学", "code": "10320", "type": "公办本科", "city": "徐州", "majors": [
        { "name": "物理学（师范）", "category": "师范", "minScore": 545, "avgScore": 550, "minRank": 19500, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" },
        { "name": "历史学（师范）", "category": "师范", "minScore": 542, "avgScore": 546, "minRank": 21000, "planCount": 35, "actualCount": 35, "subjectGroup": "history" },
        { "name": "地理科学（师范）", "category": "师范", "minScore": 538, "avgScore": 542, "minRank": 23000, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "汉语言文学", "category": "文学", "minScore": 555, "avgScore": 558, "minRank": 15800, "planCount": 40, "actualCount": 40, "subjectGroup": "history" }
      ]}
    ]
  },
  henan: { "province": "河南", "year": 2026, "batchLines": { "physics": { "本科": 419, "特招": 513 }, "history": { "本科": 459, "特招": 534 } }, "schools": [] },
  hebei: { "province": "河北", "year": 2026, "batchLines": { "physics": { "本科": 443, "特招": 510 }, "history": { "本科": 485, "特招": 542 } }, "schools": [] },
  beijing: { "province": "北京", "year": 2026, "batchLines": { "physics": { "本科": 429, "特招": 521 }, "history": { "本科": 429, "特招": 521 } }, "schools": [] },
  tianjin: { "province": "天津", "year": 2026, "batchLines": { "physics": { "本科": 458, "特招": 547 }, "history": { "本科": 458, "特招": 547 } }, "schools": [] },
  shanghai: { "province": "上海", "year": 2026, "batchLines": { "physics": { "本科": 403, "特招": 504 }, "history": { "本科": 403, "特招": 504 } }, "schools": [] },
  heilongjiang: { "province": "黑龙江", "year": 2026, "batchLines": { "physics": { "本科": 340, "特招": 464 }, "history": { "本科": 385, "特招": 466 } }, "schools": [] }
};

const DataLoader = {
  PROVINCE_MAP: {
    '江苏': 'jiangsu',
    '河南': 'henan',
    '河北': 'hebei',
    '上海': 'shanghai',
    '北京': 'beijing',
    '天津': 'tianjin',
    '黑龙江': 'heilongjiang'
  },

  SUBJECT_KEY_MAP: {
    '物理类': 'physics',
    '历史类': 'history'
  },

  // 优先尝试从 JSON 文件加载（在线时数据可独立更新），失败则用内嵌数据
  async loadProvinceData(provinceKey) {
    // 先尝试 fetch JSON（在线模式，支持热更新数据）
    try {
      const url = `data/${provinceKey}.json`;
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (e) {
      // fetch 失败（本地打开 file:// 协议等），静默回退到内嵌数据
    }

    // 回退到内嵌数据
    if (EMBEDDED_DATA[provinceKey]) {
      console.log(`📦 使用内嵌数据: ${provinceKey}`);
      return Promise.resolve(EMBEDDED_DATA[provinceKey]);
    }

    throw new Error(`${provinceKey} 数据未找到，请确保 data/${provinceKey}.json 存在`);
  },

  getBatchLines(data, subjectType) {
    const subjectKey = this.SUBJECT_KEY_MAP[subjectType];
    if (!subjectKey || !data.batchLines || !data.batchLines[subjectKey]) {
      return null;
    }
    return data.batchLines[subjectKey];
  },

  getMajorsBySubject(data, subjectType) {
    const subjectKey = this.SUBJECT_KEY_MAP[subjectType];
    if (!subjectKey) return [];

    const results = [];
    for (const school of data.schools) {
      for (const major of school.majors) {
        if (major.subjectGroup === subjectKey) {
          results.push({
            schoolName: school.name,
            schoolCode: school.code,
            schoolType: school.type,
            city: school.city,
            majorName: major.name,
            category: major.category,
            minScore: major.minScore,
            avgScore: major.avgScore,
            minRank: major.minRank,
            planCount: major.planCount,
            actualCount: major.actualCount
          });
        }
      }
    }
    return results;
  }
};
