// Prompt 拼装模块 — 负责分数分档和 Prompt 模板渲染

const TIER_RANGES = {
  rush:   { min: 0,    max: 20,   exclusiveMin: true  },  // 冲刺：0 < diff <= 20
  steady: { min: -10,  max: 0,    exclusiveMin: false },  // 稳妥：-10 <= diff <= 0
  safe:   { min: -40,  max: -10,  exclusiveMin: false }   // 保底：-40 <= diff <= -10
};

function tierMajors(majors, userScore) {
  const result = { rush: [], steady: [], safe: [] };
  const withDiff = majors.map(m => ({ ...m, diff: m.minScore - userScore }));

  for (const m of withDiff) {
    const { diff } = m;
    if (diff > TIER_RANGES.rush.min && diff <= TIER_RANGES.rush.max) {
      result.rush.push(m);
    } else if (diff >= TIER_RANGES.steady.min && diff <= TIER_RANGES.steady.max) {
      result.steady.push(m);
    } else if (diff >= TIER_RANGES.safe.min && diff <= TIER_RANGES.safe.max) {
      result.safe.push(m);
    }
  }

  for (const tier of ['rush', 'steady', 'safe']) {
    result[tier].sort((a, b) => b.diff - a.diff);
  }
  return result;
}

function buildPrompt(userInfo, tieredData, preferences) {
  const { province, subjectType, score, rank, batchLine } = userInfo;
  const provinceData = tieredData._provinceData;
  const year = provinceData ? provinceData.year : '2024';
  const lines = [];

  lines.push('# 高考志愿填报分析请求\n');
  lines.push('## 1. 考生画像\n');
  lines.push(`- 省份：${province}`);
  lines.push(`- 选科类型：${subjectType}`);
  lines.push(`- 高考分数：${score} 分`);
  if (rank) lines.push(`- 全省位次：约 ${rank} 名`);
  lines.push(`- 批次线：${batchLine ? '本科 ' + batchLine + ' 分' : '未提供'}`);
  lines.push('');

  lines.push(`## 2. 真实录取数据参考（以下为 ${province} ${year} 年实际录取数据，请严格基于此数据分析）\n`);

  const tierConfig = [
    { key: 'rush', emoji: '🚀', label: '冲刺档', desc: '录取最低分高于考生分数 1-20 分，需要一定运气' },
    { key: 'steady', emoji: '✅', label: '稳妥档', desc: '录取最低分在考生分数 ±10 分以内，录取概率较高' },
    { key: 'safe', emoji: '🛡️', label: '保底档', desc: '考生分数高于录取最低分 10-40 分，录取概率很高' }
  ];

  for (const tc of tierConfig) {
    const items = tieredData[tc.key];
    if (items.length === 0) {
      lines.push(`### ${tc.emoji} ${tc.label}（0 个专业）\n`);
      lines.push('该分数段暂无匹配数据。\n');
      continue;
    }
    const schoolSet = new Set(items.map(m => m.schoolName));
    lines.push(`### ${tc.emoji} ${tc.label}（${schoolSet.size} 所院校，${items.length} 个专业）`);
    lines.push(`> ${tc.desc}\n`);
    lines.push('| 院校 | 层次 | 城市 | 专业 | 最低分 | 平均分 | 位次 | 招生人数 | 分差 |');
    lines.push('|------|------|------|------|--------|--------|------|----------|------|');
    for (const m of items) {
      const diffStr = m.diff > 0 ? `+${m.diff}` : `${m.diff}`;
      lines.push(`| ${m.schoolName} | ${m.schoolType} | ${m.city} | ${m.majorName} | ${m.minScore} | ${m.avgScore} | ${m.minRank} | ${m.planCount} | ${diffStr} |`);
    }
    lines.push('');
  }

  lines.push('## 3. 考生偏好\n');
  const categoryLabels = {
    region: '地域倾向', schoolLevel: '学校层次', majorDirection: '专业方向', careerGoal: '发展倾向'
  };
  const tagLines = [];
  if (preferences.tags) {
    for (const [category, selected] of Object.entries(preferences.tags)) {
      if (selected.length > 0) {
        tagLines.push(`- ${categoryLabels[category] || category}：${selected.join('、')}`);
      }
    }
  }
  lines.push(...(tagLines.length > 0 ? tagLines : ['- 无特殊偏好']));
  if (preferences.freeText && preferences.freeText.trim()) {
    lines.push(`- 个人补充：${preferences.freeText.trim()}`);
  }
  lines.push('');

  lines.push('## 4. 分析输出要求\n');
  lines.push('请基于以上提供的真实录取数据和考生偏好，严格按照以下结构输出分析结果：\n');
  lines.push('### a) 冲/稳/保三档推荐表');
  lines.push('- 从每档中挑选最值得报考的院校+专业组合（每档推荐 5-10 个）');
  lines.push('- 每个推荐标注：录取概率评估（低/中/高）、与去年分数差值');
  lines.push('- 专业实力简评（参考学科评估等级、是否国家级特色专业、是否双一流学科）');
  lines.push('- **注意**：不要推荐考生没有报考资格的专业\n');
  lines.push('### b) 专业就业前景分析');
  lines.push('- 对推荐的各类专业，分别分析就业方向（毕业后主要去向、典型企业/岗位）');
  lines.push('- 行业发展趋势（未来 3-5 年就业市场供需预测）');
  lines.push('- 应届生薪资水平参考（按一线/二线城市区分）\n');
  lines.push('### c) 个性化建议');
  lines.push('- 结合考生的标签偏好和个人补充描述，给出针对性推荐排序');
  lines.push('- 如果偏好之间存在矛盾（例如「想留省内」但省内目标院校分数不够），请明确指出并给出折中方案');
  lines.push('- 如果考生未填写偏好，请结合数据中专业的就业质量、发展前景给出综合性建议\n');
  lines.push('### d) 风险提示与备选方案');
  lines.push('- 冲刺档的风险点（大小年现象、专业调剂风险、退档风险）');
  lines.push('- 如滑档的应急预案（征集志愿策略、下一批次优质院校推荐）');
  lines.push('- 是否建议服从调剂及其利弊分析\n');
  lines.push('### e) 文件输出（方便保存）');
  lines.push('请在所有分析完成后，额外输出以下可直接保存为文件的内容：\n');
  lines.push('**1. CSV 志愿填报表**（用代码块包裹，用户复制后存为 .csv 文件即可用 Excel 打开）：');
  lines.push('```csv');
  lines.push('档次,院校,专业,城市,层次,最低分,分差,录取概率,推荐理由');
  lines.push('冲刺,XX大学,计算机,南京,985,660,+5,低,专业实力强');
  lines.push('...（请按此格式输出所有推荐组合）');
  lines.push('```\n');
  lines.push('**2. 完整分析报告**（Markdown 格式，用户可复制存为 .md 文件）：');
  lines.push('- 将上述 a/b/c/d 四部分分析整理为一份完整的 Markdown 报告');
  lines.push('- 包含标题层级、表格、重点加粗等格式');
  lines.push('- 便于用户保存、打印或分享给家人讨论\n');
  lines.push('---');
  lines.push('请确保分析具体、量化、可操作，避免泛泛而谈。所有数据引用以本 Prompt 提供的真实录取数据为准。');

  return lines.join('\n');
}

const PromptBuilder = { tierMajors, buildPrompt };
