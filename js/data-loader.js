// 数据加载模块 — 负责加载省份 JSON 数据并提取信息
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

  async loadProvinceData(provinceKey) {
    const url = `data/${provinceKey}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`数据加载失败: ${response.status} ${response.statusText}`);
    }
    return response.json();
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
