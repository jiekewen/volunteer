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
  lines.push('### e) 生成可下载的报告文件\n');
  lines.push('请在完成以上 a/b/c/d 全部分析后，将**所有内容**整合为一份完整的 HTML 网页文件，用代码块输出。用户复制后保存为 .html 文件，双击即可在浏览器中打开一份排版精美的完整报告。\n');
  lines.push('HTML 文件要求：');
  lines.push('- 使用简洁优雅的 CSS 样式（卡片布局、配色清爽、适合打印）');
  lines.push('- 包含以下完整内容：考生画像、三档推荐表格、就业前景分析、个性化建议、风险提示');
  lines.push('- 表格要清晰，重要信息加粗或高亮');
  lines.push('- 移动端也能正常查看');
  lines.push('- 文件自包含，无需任何外部依赖\n');
  lines.push('```html');
  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="zh-CN">');
  lines.push('<head><meta charset="UTF-8"><title>高考志愿填报分析报告</title>');
  lines.push('<style>/* 你的 CSS 样式 */</style></head>');
  lines.push('<body>');
  lines.push('  <!-- 考生画像 -->');
  lines.push('  <!-- 冲稳保推荐表格 -->');
  lines.push('  <!-- 就业前景分析 -->');
  lines.push('  <!-- 个性化建议 -->');
  lines.push('  <!-- 风险提示 -->');
  lines.push('</body></html>');
  lines.push('```\n');
  lines.push('---');
  lines.push('请确保分析具体、量化、可操作，避免泛泛而谈。所有数据引用以本 Prompt 提供的真实录取数据为准。');
  lines.push('');
  lines.push('> 📌 使用方式：将上方 HTML 代码块完整复制，保存为「志愿填报分析报告.html」，双击即可在浏览器打开一份完整报告，可直接打印或发送给家人。');

  return lines.join('\n');
}

const PromptBuilder = { tierMajors, buildPrompt };
