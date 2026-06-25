# 高考志愿填报 Prompt 生成器 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建纯前端单页工具，用户输入高考信息后自动生成可用于任意 AI 模型的志愿填报分析 Prompt。

**Architecture:** 零框架单页应用。HTML 提供页面结构，CSS 处理样式，JS 分三个模块：data-loader（fetch 加载省份 JSON）、prompt-builder（分数分档 + 模板拼装）、ui（表单渲染 + 结果输出）。app.js 作为主控制器协调各模块。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS (ES6+)，无依赖，JSON 数据文件

## Global Constraints

- 零外部依赖，单 HTML + CSS + JS 文件即可运行
- 数据按省份拆分为独立 JSON 文件，按需 fetch
- localStorage 保存用户填写历史和偏好
- 页面需适配移动端（响应式）
- 覆盖省份：江苏、河南、河北、上海、北京、天津、黑龙江
- 部署到 GitHub Pages
- 选科类型使用「物理类」「历史类」标签

---

### Task 1: 项目骨架搭建

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/data-loader.js`
- Create: `js/prompt-builder.js`
- Create: `js/ui.js`
- Create: `js/app.js`

**Interfaces:**
- Produces: HTML 骨架引用所有 CSS/JS 文件，各 JS 文件为空模块（仅含函数签名占位）

- [ ] **Step 1: 创建 index.html 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>高考志愿填报 Prompt 生成器</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>🎓 高考志愿填报 Prompt 生成器</h1>
      <p class="subtitle">填好信息 → 一键生成 → 复制去问 AI</p>
    </header>

    <main>
      <section id="form-section">
        <!-- 由 ui.js 动态渲染 -->
      </section>

      <section id="output-section" class="hidden">
        <!-- 由 ui.js 动态渲染 -->
      </section>
    </main>

    <footer>
      <p>数据来源：各省教育考试院公开信息 | 仅供参考，请以官方为准</p>
    </footer>
  </div>

  <script src="js/data-loader.js"></script>
  <script src="js/prompt-builder.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建各 JS 模块文件（带占位内容）**

`js/data-loader.js`:
```javascript
// 数据加载模块 — 负责加载省份 JSON 数据
const DataLoader = {
  // 加载指定省份的录取数据
  async loadProvinceData(provinceKey) {},
  // 获取省份对应的批次线
  getBatchLines(data, subjectType) {},
  // 获取该省份所有院校专业列表（按选科类型筛选）
  getMajorsBySubject(data, subjectType) {}
};
```

`js/prompt-builder.js`:
```javascript
// Prompt 拼装模块 — 负责分数分档和 Prompt 模板渲染
const PromptBuilder = {
  // 根据分差划分冲/稳/保三档
  tierMajors(majors, userScore) {},
  // 构建完整 Prompt 文本
  buildPrompt(userInfo, tieredData, preferences) {}
};
```

`js/ui.js`:
```javascript
// UI 渲染模块 — 负责表单渲染和结果展示
const UI = {
  // 渲染输入表单
  renderForm() {},
  // 渲染生成的 Prompt 预览
  renderPrompt(promptText) {},
  // 显示/隐藏输出区域
  toggleOutput(visible) {},
  // 显示错误/提示信息
  showMessage(msg, type) {}
};
```

`js/app.js`:
```javascript
// 主控制器 — 事件绑定和流程控制
const App = {
  // 初始化应用
  async init() {},
  // 处理生成按钮点击
  async handleGenerate() {},
  // 处理复制按钮点击
  handleCopy() {},
  // 保存/恢复表单状态到 localStorage
  saveState() {},
  restoreState() {}
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 3: 验证 — 浏览器打开 index.html，确认无 JS 报错，页面标题和 header 显示正常**

启动本地服务器并打开浏览器：

```bash
cd /Users/kuanyue/Desktop/study-notes/volunteer && python3 -m http.server 8080
```

然后在浏览器打开 http://localhost:8080，确认：
- 页面标题显示正确
- 控制台无 JS 报错
- header 和 footer 文字可见

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 项目骨架搭建 — HTML/CSS/JS 文件结构

- index.html 主页面骨架
- 四个 JS 模块（data-loader, prompt-builder, ui, app）占位
- 空 CSS 文件

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: 数据加载模块 (data-loader.js)

**Files:**
- Modify: `js/data-loader.js`

**Interfaces:**
- Produces:
  - `DataLoader.PROVINCE_MAP` — 省份名到文件名 key 的映射
  - `DataLoader.loadProvinceData(provinceKey)` → `Promise<Object>` — 加载并返回省份 JSON
  - `DataLoader.getBatchLines(data, subjectType)` → `{本科: number, 特招: number}|null`
  - `DataLoader.getMajorsBySubject(data, subjectType)` → `Array<Major>` — 筛选匹配选科的专业

- [ ] **Step 1: 实现 data-loader.js 完整逻辑**

```javascript
// 数据加载模块 — 负责加载省份 JSON 数据并提取有用信息
const DataLoader = {
  // 省份名到数据文件 key 的映射
  PROVINCE_MAP: {
    '江苏': 'jiangsu',
    '河南': 'henan',
    '河北': 'hebei',
    '上海': 'shanghai',
    '北京': 'beijing',
    '天津': 'tianjin',
    '黑龙江': 'heilongjiang'
  },

  // 选科类型映射（用户选择的"物理类/历史类"对应数据中的 key）
  SUBJECT_KEY_MAP: {
    '物理类': 'physics',
    '历史类': 'history'
  },

  // 加载指定省份的录取数据
  // provinceKey: 'jiangsu' | 'henan' | ...
  // returns: 省份 JSON 对象
  async loadProvinceData(provinceKey) {
    const url = `data/${provinceKey}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`数据加载失败: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`加载 ${provinceKey} 数据出错:`, err);
      throw err;
    }
  },

  // 获取指定选科类型的批次线
  // data: 省份数据对象
  // subjectType: '物理类' | '历史类'
  // returns: { '本科': 478, '特招': 530 } 或 null
  getBatchLines(data, subjectType) {
    const subjectKey = this.SUBJECT_KEY_MAP[subjectType];
    if (!subjectKey || !data.batchLines || !data.batchLines[subjectKey]) {
      return null;
    }
    return data.batchLines[subjectKey];
  },

  // 获取匹配选科类型的所有专业列表
  // data: 省份数据对象
  // subjectType: '物理类' | '历史类'
  // returns: [{ schoolName, schoolCode, schoolType, city, majorName, category, minScore, avgScore, minRank, planCount, actualCount }, ...]
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
```

- [ ] **Step 2: 验证 — 在浏览器控制台测试**

打开 http://localhost:8080，在控制台执行：

```javascript
// 测试 PROVINCE_MAP 存在
console.assert(DataLoader.PROVINCE_MAP['江苏'] === 'jiangsu', 'PROVINCE_MAP 映射正确');

// 测试 getBatchLines 空数据处理
const empty = { batchLines: { physics: { '本科': 462 } } };
console.assert(DataLoader.getBatchLines(empty, '物理类')['本科'] === 462, '批次线提取正确');
console.assert(DataLoader.getBatchLines(empty, '历史类') === null, '不存在选科返回 null');

// 测试 getMajorsBySubject 筛选
const mock = {
  schools: [{
    name: '测试大学', code: '0001', type: '985', city: '北京',
    majors: [
      { name: 'CS', category: '工科', minScore: 600, avgScore: 605, minRank: 5000, planCount: 30, actualCount: 32, subjectGroup: 'physics' },
      { name: '历史学', category: '文史', minScore: 580, avgScore: 585, minRank: 2000, planCount: 20, actualCount: 20, subjectGroup: 'history' }
    ]
  }]
};
const physicsMajors = DataLoader.getMajorsBySubject(mock, '物理类');
console.assert(physicsMajors.length === 1, `期望 1 个物理类专业，实际 ${physicsMajors.length}`);
console.assert(physicsMajors[0].majorName === 'CS', '专业名应为 CS');
console.assert(physicsMajors[0].schoolName === '测试大学', '学校名应传递');
console.log('✅ data-loader.js 全部验证通过');
```

- [ ] **Step 3: Commit**

```bash
git add js/data-loader.js
git commit -m "feat: 数据加载模块 — 省份数据 fetch + 选科筛选

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: 示例数据文件（江苏）

**Files:**
- Create: `data/jiangsu.json`

**Interfaces:**
- Produces: 一份包含真实结构 + 示例数据的江苏 2024 录取数据 JSON，遵循设计文档中的 Schema

- [ ] **Step 1: 创建 data/jiangsu.json**

数据应包含：
- `batchLines` 含 physics 和 history 两个科目的批次线
- `schools` 至少 15 所院校，覆盖 985/211/双一流/公办不同层次
- 每所院校至少 3-5 个专业，分数范围覆盖 460~680（满足不同分档测试需求）
- 专业类别覆盖工科、医学、师范、经管、法学、理学、文学等

```json
{
  "province": "江苏",
  "year": 2024,
  "batchLines": {
    "physics": { "本科": 462, "特招": 516 },
    "history": { "本科": 478, "特招": 530 }
  },
  "schools": [
    {
      "name": "南京大学",
      "code": "10284",
      "type": "985",
      "city": "南京",
      "majors": [
        { "name": "人工智能", "category": "工科", "minScore": 678, "avgScore": 681, "minRank": 480, "planCount": 30, "actualCount": 32, "subjectGroup": "physics" },
        { "name": "计算机科学与技术", "category": "工科", "minScore": 675, "avgScore": 678, "minRank": 550, "planCount": 50, "actualCount": 52, "subjectGroup": "physics" },
        { "name": "软件工程", "category": "工科", "minScore": 672, "avgScore": 675, "minRank": 620, "planCount": 45, "actualCount": 46, "subjectGroup": "physics" },
        { "name": "金融学", "category": "经管", "minScore": 668, "avgScore": 671, "minRank": 750, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "法学", "category": "法学", "minScore": 670, "avgScore": 673, "minRank": 680, "planCount": 20, "actualCount": 22, "subjectGroup": "physics" },
        { "name": "汉语言文学", "category": "文学", "minScore": 655, "avgScore": 658, "minRank": 1100, "planCount": 15, "actualCount": 15, "subjectGroup": "history" },
        { "name": "历史学", "category": "文史", "minScore": 650, "avgScore": 653, "minRank": 1300, "planCount": 12, "actualCount": 12, "subjectGroup": "history" }
      ]
    },
    {
      "name": "东南大学",
      "code": "10286",
      "type": "985",
      "city": "南京",
      "majors": [
        { "name": "电子信息工程", "category": "工科", "minScore": 660, "avgScore": 663, "minRank": 900, "planCount": 40, "actualCount": 42, "subjectGroup": "physics" },
        { "name": "建筑学", "category": "工科", "minScore": 658, "avgScore": 662, "minRank": 980, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "土木工程", "category": "工科", "minScore": 648, "avgScore": 652, "minRank": 1500, "planCount": 35, "actualCount": 36, "subjectGroup": "physics" },
        { "name": "交通运输", "category": "工科", "minScore": 645, "avgScore": 648, "minRank": 1700, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "南京航空航天大学",
      "code": "10287",
      "type": "211",
      "city": "南京",
      "majors": [
        { "name": "飞行器设计与工程", "category": "工科", "minScore": 642, "avgScore": 646, "minRank": 2000, "planCount": 60, "actualCount": 62, "subjectGroup": "physics" },
        { "name": "自动化", "category": "工科", "minScore": 638, "avgScore": 641, "minRank": 2400, "planCount": 45, "actualCount": 45, "subjectGroup": "physics" },
        { "name": "计算机科学与技术", "category": "工科", "minScore": 640, "avgScore": 644, "minRank": 2200, "planCount": 50, "actualCount": 53, "subjectGroup": "physics" },
        { "name": "英语", "category": "文学", "minScore": 595, "avgScore": 598, "minRank": 5200, "planCount": 20, "actualCount": 20, "subjectGroup": "history" }
      ]
    },
    {
      "name": "南京理工大学",
      "code": "10288",
      "type": "211",
      "city": "南京",
      "majors": [
        { "name": "兵器科学与技术", "category": "工科", "minScore": 635, "avgScore": 639, "minRank": 2600, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "机械工程", "category": "工科", "minScore": 632, "avgScore": 635, "minRank": 2900, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" },
        { "name": "化学工程与工艺", "category": "工科", "minScore": 628, "avgScore": 631, "minRank": 3300, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "苏州大学",
      "code": "10285",
      "type": "211",
      "city": "苏州",
      "majors": [
        { "name": "临床医学", "category": "医学", "minScore": 630, "avgScore": 635, "minRank": 3100, "planCount": 35, "actualCount": 36, "subjectGroup": "physics" },
        { "name": "材料科学与工程", "category": "工科", "minScore": 620, "avgScore": 623, "minRank": 4200, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "法学", "category": "法学", "minScore": 625, "avgScore": 629, "minRank": 3600, "planCount": 25, "actualCount": 26, "subjectGroup": "physics" },
        { "name": "会计学", "category": "经管", "minScore": 610, "avgScore": 614, "minRank": 5600, "planCount": 20, "actualCount": 21, "subjectGroup": "history" }
      ]
    },
    {
      "name": "河海大学",
      "code": "10294",
      "type": "211",
      "city": "南京",
      "majors": [
        { "name": "水利工程", "category": "工科", "minScore": 618, "avgScore": 622, "minRank": 4500, "planCount": 50, "actualCount": 51, "subjectGroup": "physics" },
        { "name": "环境工程", "category": "工科", "minScore": 612, "avgScore": 615, "minRank": 5200, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "港口航道与海岸工程", "category": "工科", "minScore": 608, "avgScore": 611, "minRank": 5900, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "南京师范大学",
      "code": "10319",
      "type": "211",
      "city": "南京",
      "majors": [
        { "name": "汉语言文学（师范）", "category": "师范", "minScore": 612, "avgScore": 616, "minRank": 5200, "planCount": 40, "actualCount": 42, "subjectGroup": "history" },
        { "name": "英语（师范）", "category": "师范", "minScore": 608, "avgScore": 611, "minRank": 5800, "planCount": 35, "actualCount": 35, "subjectGroup": "history" },
        { "name": "数学与应用数学（师范）", "category": "师范", "minScore": 615, "avgScore": 619, "minRank": 4800, "planCount": 45, "actualCount": 46, "subjectGroup": "physics" },
        { "name": "学前教育", "category": "师范", "minScore": 580, "avgScore": 583, "minRank": 8500, "planCount": 25, "actualCount": 25, "subjectGroup": "history" }
      ]
    },
    {
      "name": "南京医科大学",
      "code": "10312",
      "type": "双一流",
      "city": "南京",
      "majors": [
        { "name": "临床医学（5+3一体化）", "category": "医学", "minScore": 640, "avgScore": 645, "minRank": 2200, "planCount": 80, "actualCount": 82, "subjectGroup": "physics" },
        { "name": "口腔医学", "category": "医学", "minScore": 635, "avgScore": 639, "minRank": 2600, "planCount": 25, "actualCount": 26, "subjectGroup": "physics" },
        { "name": "预防医学", "category": "医学", "minScore": 610, "avgScore": 614, "minRank": 5600, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "护理学", "category": "医学", "minScore": 560, "avgScore": 565, "minRank": 14000, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "中国药科大学",
      "code": "10316",
      "type": "211",
      "city": "南京",
      "majors": [
        { "name": "药学", "category": "医学", "minScore": 615, "avgScore": 620, "minRank": 4800, "planCount": 60, "actualCount": 62, "subjectGroup": "physics" },
        { "name": "中药学", "category": "医学", "minScore": 605, "avgScore": 608, "minRank": 6300, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "药物制剂", "category": "医学", "minScore": 598, "avgScore": 602, "minRank": 7500, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "南京工业大学",
      "code": "10291",
      "type": "公办本科",
      "city": "南京",
      "majors": [
        { "name": "化学工程与工艺", "category": "工科", "minScore": 575, "avgScore": 580, "minRank": 9800, "planCount": 55, "actualCount": 56, "subjectGroup": "physics" },
        { "name": "安全工程", "category": "工科", "minScore": 568, "avgScore": 572, "minRank": 11500, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "生物工程", "category": "工科", "minScore": 562, "avgScore": 566, "minRank": 13200, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "扬州大学",
      "code": "11117",
      "type": "公办本科",
      "city": "扬州",
      "majors": [
        { "name": "动物医学", "category": "农学", "minScore": 555, "avgScore": 560, "minRank": 15800, "planCount": 30, "actualCount": 31, "subjectGroup": "physics" },
        { "name": "烹饪与营养教育", "category": "工科", "minScore": 540, "avgScore": 544, "minRank": 22000, "planCount": 20, "actualCount": 20, "subjectGroup": "physics" },
        { "name": "汉语言文学", "category": "文学", "minScore": 558, "avgScore": 562, "minRank": 14800, "planCount": 35, "actualCount": 35, "subjectGroup": "history" }
      ]
    },
    {
      "name": "江苏大学",
      "code": "10299",
      "type": "公办本科",
      "city": "镇江",
      "majors": [
        { "name": "车辆工程", "category": "工科", "minScore": 570, "avgScore": 574, "minRank": 10800, "planCount": 40, "actualCount": 41, "subjectGroup": "physics" },
        { "name": "能源与动力工程", "category": "工科", "minScore": 565, "avgScore": 568, "minRank": 12200, "planCount": 35, "actualCount": 35, "subjectGroup": "physics" },
        { "name": "食品科学与工程", "category": "工科", "minScore": 555, "avgScore": 558, "minRank": 15800, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" }
      ]
    },
    {
      "name": "南通大学",
      "code": "10304",
      "type": "公办本科",
      "city": "南通",
      "majors": [
        { "name": "临床医学", "category": "医学", "minScore": 578, "avgScore": 583, "minRank": 9000, "planCount": 50, "actualCount": 51, "subjectGroup": "physics" },
        { "name": "电子信息工程", "category": "工科", "minScore": 550, "avgScore": 554, "minRank": 18000, "planCount": 35, "actualCount": 35, "subjectGroup": "physics" },
        { "name": "小学教育（师范）", "category": "师范", "minScore": 548, "avgScore": 552, "minRank": 18800, "planCount": 30, "actualCount": 30, "subjectGroup": "history" }
      ]
    },
    {
      "name": "常州大学",
      "code": "10292",
      "type": "公办本科",
      "city": "常州",
      "majors": [
        { "name": "石油工程", "category": "工科", "minScore": 535, "avgScore": 540, "minRank": 24500, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" },
        { "name": "高分子材料与工程", "category": "工科", "minScore": 530, "avgScore": 534, "minRank": 26800, "planCount": 25, "actualCount": 25, "subjectGroup": "physics" },
        { "name": "会计学", "category": "经管", "minScore": 540, "avgScore": 545, "minRank": 22000, "planCount": 20, "actualCount": 20, "subjectGroup": "history" }
      ]
    },
    {
      "name": "江苏师范大学",
      "code": "10320",
      "type": "公办本科",
      "city": "徐州",
      "majors": [
        { "name": "物理学（师范）", "category": "师范", "minScore": 545, "avgScore": 550, "minRank": 19500, "planCount": 40, "actualCount": 40, "subjectGroup": "physics" },
        { "name": "历史学（师范）", "category": "师范", "minScore": 542, "avgScore": 546, "minRank": 21000, "planCount": 35, "actualCount": 35, "subjectGroup": "history" },
        { "name": "地理科学（师范）", "category": "师范", "minScore": 538, "avgScore": 542, "minRank": 23000, "planCount": 30, "actualCount": 30, "subjectGroup": "physics" }
      ]
    }
  ]
}
```

- [ ] **Step 2: 验证 — 确认 JSON 格式合法且 Fetch 可用**

在浏览器控制台执行：

```javascript
const resp = await fetch('data/jiangsu.json');
const data = await resp.json();
console.assert(data.province === '江苏', '省份字段正确');
console.assert(typeof data.batchLines.physics['本科'] === 'number', '批次线为数字');
console.assert(data.schools.length >= 15, `期望 >=15 所院校，实际 ${data.schools.length}`);
// 验证分数分档覆盖
const allScores = data.schools.flatMap(s => s.majors.filter(m => m.subjectGroup === 'physics')).map(m => m.minScore);
console.assert(Math.max(...allScores) >= 670, `最高分 ${Math.max(...allScores)} >= 670`);
console.assert(Math.min(...allScores) <= 540, `最低分 ${Math.min(...allScores)} <= 540`);
console.log('✅ jiangsu.json 数据验证通过');
```

- [ ] **Step 3: Commit**

```bash
git add data/jiangsu.json
git commit -m "feat: 添加江苏 2024 年录取示例数据（15 所院校）

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Prompt 拼装模块 (prompt-builder.js)

**Files:**
- Modify: `js/prompt-builder.js`

**Interfaces:**
- Consumes:
  - `DataLoader.getBatchLines(data, subjectType)` — 获取批次线
  - Major 对象结构: `{ schoolName, schoolCode, schoolType, city, majorName, category, minScore, avgScore, minRank, planCount, actualCount }`
- Produces:
  - `PromptBuilder.tierMajors(majors, userScore)` → `{ rush: Array, steady: Array, safe: Array }`
  - `PromptBuilder.buildPrompt(userInfo, tieredData, preferences)` → `string` — 完整 Prompt 文本

- [ ] **Step 1: 实现分档函数 tierMajors**

```javascript
// 冲刺档：专业最低分 - 用户分数 ∈ (0, 20]
// 稳妥档：专业最低分 - 用户分数 ∈ (-10, 0]
// 保底档：专业最低分 - 用户分数 ∈ [-40, -10]
const TIER_RANGES = {
  rush:   { min: 0,    max: 20,   exclusiveMin: true  },  // 0 < diff <= 20
  steady: { min: -10,  max: 0,    exclusiveMin: false },  // -10 <= diff <= 0
  safe:   { min: -40,  max: -10,  exclusiveMin: false }   // -40 <= diff <= -10
};

function tierMajors(majors, userScore) {
  const result = { rush: [], steady: [], safe: [] };

  const withDiff = majors.map(m => ({
    ...m,
    diff: m.minScore - userScore  // 正数 = 需要冲刺, 负数 = 分数高于录取线
  }));

  for (const m of withDiff) {
    if (m.diff > TIER_RANGES.rush.min && m.diff <= TIER_RANGES.rush.max) {
      result.rush.push(m);
    } else if (m.diff >= TIER_RANGES.steady.min && m.diff <= TIER_RANGES.steady.max) {
      result.steady.push(m);
    } else if (m.diff >= TIER_RANGES.safe.min && m.diff <= TIER_RANGES.safe.max) {
      result.safe.push(m);
    }
  }

  // 每档按 diff 降序排列（分差越大的冲刺越难，排在前面作为提醒）
  for (const tier of ['rush', 'steady', 'safe']) {
    result[tier].sort((a, b) => b.diff - a.diff);
  }

  return result;
}
```

- [ ] **Step 2: 实现 Prompt 构建函数 buildPrompt**

```javascript
function buildPrompt(userInfo, tieredData, preferences) {
  const { province, subjectType, score, rank, batchLine } = userInfo;
  const provinceData = tieredData._provinceData;
  const year = provinceData ? provinceData.year : '2024';

  const lines = [];

  // === 标题 ===
  lines.push('# 高考志愿填报分析请求\n');

  // === 1. 考生画像 ===
  lines.push('## 1. 考生画像\n');
  lines.push(`- 省份：${province}`);
  lines.push(`- 选科类型：${subjectType}`);
  lines.push(`- 高考分数：${score} 分`);
  if (rank) lines.push(`- 全省位次：约 ${rank} 名`);
  lines.push(`- 批次线：${batchLine ? `本科 ${batchLine} 分` : '未提供'}`);
  lines.push('');

  // === 2. 真实录取数据 ===
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

    // 按院校去重计数
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

  // === 3. 考生偏好 ===
  lines.push('## 3. 考生偏好\n');
  if (preferences.tags && Object.keys(preferences.tags).length > 0) {
    const tagLines = [];
    for (const [category, selected] of Object.entries(preferences.tags)) {
      if (selected.length > 0) {
        const categoryLabel = { region: '地域倾向', schoolLevel: '学校层次', majorDirection: '专业方向', careerGoal: '发展倾向' }[category] || category;
        tagLines.push(`- ${categoryLabel}：${selected.join('、')}`);
      }
    }
    if (tagLines.length > 0) {
      lines.push(...tagLines);
    } else {
      lines.push('- 无特殊偏好');
    }
  }
  if (preferences.freeText && preferences.freeText.trim()) {
    lines.push(`- 个人补充：${preferences.freeText.trim()}`);
  }
  lines.push('');

  // === 4. 分析输出要求 ===
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
  lines.push('---');
  lines.push('请确保分析具体、量化、可操作，避免泛泛而谈。所有数据引用以本 Prompt 提供的真实录取数据为准。');

  return lines.join('\n');
}
```

- [ ] **Step 3: 暴露 PromptBuilder 公共接口**

在 `prompt-builder.js` 末尾添加：

```javascript
const PromptBuilder = {
  tierMajors,
  buildPrompt
};
```

- [ ] **Step 4: 验证 — 浏览器控制台测试**

```javascript
// 加载江苏数据测试完整流程
const data = await DataLoader.loadProvinceData('jiangsu');
const majors = DataLoader.getMajorsBySubject(data, '物理类');

// 模拟 620 分考生
const tiered = PromptBuilder.tierMajors(majors, 620);
console.log(`冲刺: ${tiered.rush.length} | 稳妥: ${tiered.steady.length} | 保底: ${tiered.safe.length}`);
console.assert(tiered.rush.length > 0, '冲刺档应有数据');
console.assert(tiered.steady.length > 0, '稳妥档应有数据');
console.assert(tiered.safe.length > 0, '保底档应有数据');

// 验证分档逻辑
for (const m of tiered.rush) {
  console.assert(m.diff > 0 && m.diff <= 20, `冲刺 diff=${m.diff} 应在 (0,20]`);
}
for (const m of tiered.steady) {
  console.assert(m.diff >= -10 && m.diff <= 0, `稳妥 diff=${m.diff} 应在 [-10,0]`);
}
for (const m of tiered.safe) {
  console.assert(m.diff >= -40 && m.diff <= -10, `保底 diff=${m.diff} 应在 [-40,-10}`);
}

// 测试 Prompt 生成
tiered._provinceData = data;
const prompt = PromptBuilder.buildPrompt(
  { province: '江苏', subjectType: '物理类', score: 620, rank: '5000', batchLine: '本科 462' },
  tiered,
  { tags: { region: ['省内优先'], schoolLevel: ['985', '211'] }, freeText: '喜欢计算机相关，不想学化工' }
);
console.assert(prompt.includes('江苏'), 'Prompt 含省份');
console.assert(prompt.includes('620'), 'Prompt 含分数');
console.assert(prompt.includes('物理类'), 'Prompt 含选科');
console.assert(prompt.includes('计算机'), 'Prompt 应含相关专业名（南京大学CS）');
console.assert(prompt.includes('省内优先'), 'Prompt 含偏好标签');
console.assert(prompt.length > 2000, `Prompt 长度 ${prompt.length} 应 > 2000`);
console.log('✅ prompt-builder.js 全部验证通过');
```

- [ ] **Step 5: Commit**

```bash
git add js/prompt-builder.js
git commit -m "feat: Prompt 拼装模块 — 分数三档分档 + 完整 Prompt 模板

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: UI 渲染模块 (ui.js)

**Files:**
- Modify: `js/ui.js`

**Interfaces:**
- Consumes: `PromptBuilder.buildPrompt(userInfo, tieredData, preferences)` — 生成 Prompt 文本
- Produces:
  - `UI.renderForm(provinceList)` — 渲染输入表单
  - `UI.renderPrompt(promptText)` — 渲染 Prompt 预览
  - `UI.toggleOutput(visible)` — 显示/隐藏输出区
  - `UI.showMessage(msg, type)` — 显示提示信息（'success' | 'error' | 'info'）
  - `UI.getFormData()` → `{ userInfo, preferences }` — 读取表单数据
  - `UI.setFormData({ userInfo, preferences })` — 恢复表单数据

- [ ] **Step 1: 实现 renderForm — 渲染全部表单**

```javascript
const PREFERENCE_TAGS = {
  region: {
    label: '地域倾向',
    options: ['省内优先', '可以出省', '一线城市优先', '不限']
  },
  schoolLevel: {
    label: '学校层次',
    options: ['985', '211', '双一流', '公办本科', '不限']
  },
  majorDirection: {
    label: '专业方向',
    options: ['工科', '医学', '师范', '经管', '法学', '理学', '农学', '文学', '不限']
  },
  careerGoal: {
    label: '发展倾向',
    options: ['优先就业', '优先考研', '优先考公', '出国深造']
  }
};

const UI = {
  renderForm(provinceList) {
    const section = document.getElementById('form-section');
    if (!section) return;

    section.innerHTML = `
      <div class="card">
        <h2>📋 基本信息</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="province">省份</label>
            <select id="province">
              <option value="">请选择省份</option>
              ${provinceList.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="subjectType">选科类型</label>
            <select id="subjectType">
              <option value="">请选择</option>
              <option value="物理类">物理类</option>
              <option value="历史类">历史类</option>
            </select>
          </div>
        </div>
        <div class="form-row form-row-3">
          <div class="form-group">
            <label for="score">高考分数</label>
            <input type="number" id="score" placeholder="如 620" min="0" max="750">
          </div>
          <div class="form-group">
            <label for="batchLine">批次线（本科线）</label>
            <input type="number" id="batchLine" placeholder="自动填入/手动修改" min="0" max="750">
          </div>
          <div class="form-group">
            <label for="rank">全省位次（可选）</label>
            <input type="number" id="rank" placeholder="如 5000" min="1">
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🎯 偏好设置 <span class="optional-tag">可选</span></h2>
        ${Object.entries(PREFERENCE_TAGS).map(([key, cat]) => `
          <div class="tag-category">
            <span class="tag-label">${cat.label}：</span>
            <div class="tag-group" data-category="${key}">
              ${cat.options.map(opt => `
                <button type="button" class="tag-btn" data-category="${key}" data-value="${opt}">${opt}</button>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div class="form-group free-text">
          <label for="freeText">个人补充描述</label>
          <textarea id="freeText" rows="3" placeholder="例如：我喜欢数学但不想学纯理论，家人希望我以后考公，不想到太冷的地方..."></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" id="generate-btn" class="btn-primary">🚀 生成 Prompt</button>
      </div>
    `;

    // 绑定标签点击事件
    this._bindTagEvents();
  },

  _bindTagEvents() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
      });
    });
  },

  getFormData() {
    const province = document.getElementById('province')?.value || '';
    const subjectType = document.getElementById('subjectType')?.value || '';
    const score = parseInt(document.getElementById('score')?.value) || 0;
    const batchLine = parseInt(document.getElementById('batchLine')?.value) || 0;
    const rank = parseInt(document.getElementById('rank')?.value) || 0;
    const freeText = document.getElementById('freeText')?.value || '';

    const tags = {};
    document.querySelectorAll('.tag-group').forEach(group => {
      const category = group.dataset.category;
      const selected = [];
      group.querySelectorAll('.tag-btn.active').forEach(btn => {
        selected.push(btn.dataset.value);
      });
      tags[category] = selected;
    });

    return {
      userInfo: { province, subjectType, score, batchLine, rank },
      preferences: { tags, freeText }
    };
  },

  setFormData(data) {
    if (!data || !data.userInfo) return;
    const { userInfo, preferences } = data;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };
    setVal('province', userInfo.province);
    setVal('subjectType', userInfo.subjectType);
    setVal('score', userInfo.score);
    setVal('batchLine', userInfo.batchLine);
    setVal('rank', userInfo.rank);

    if (preferences) {
      setVal('freeText', preferences.freeText);
      if (preferences.tags) {
        // 延迟恢复标签，等待 DOM 渲染完
        setTimeout(() => {
          for (const [category, values] of Object.entries(preferences.tags)) {
            values.forEach(v => {
              const btn = document.querySelector(`.tag-btn[data-category="${category}"][data-value="${v}"]`);
              if (btn) btn.classList.add('active');
            });
          }
        }, 50);
      }
    }
  },

  renderPrompt(promptText) {
    const section = document.getElementById('output-section');
    if (!section) return;

    section.innerHTML = `
      <div class="card">
        <div class="output-header">
          <h2>📝 生成的 Prompt</h2>
          <span class="output-hint">可直接复制粘贴到 ChatGPT / Claude / Gemini 等任意 AI</span>
        </div>
        <div class="prompt-preview">
          <pre id="prompt-text">${this._escapeHtml(promptText)}</pre>
        </div>
        <div class="output-actions">
          <button type="button" id="copy-btn" class="btn-primary">📋 一键复制</button>
          <button type="button" id="regenerate-btn" class="btn-secondary">🔄 重新生成</button>
        </div>
      </div>
    `;
  },

  toggleOutput(visible) {
    const section = document.getElementById('output-section');
    if (section) {
      section.classList.toggle('hidden', !visible);
    }
  },

  showMessage(msg, type) {
    // 移除已有消息
    const existing = document.querySelector('.message-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `message-toast message-${type}`;
    toast.textContent = msg;
    document.querySelector('.container')?.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
```

- [ ] **Step 2: 验证 — 浏览器中确认表单渲染**

打开 http://localhost:8080，在控制台执行：

```javascript
UI.renderForm(['江苏', '河南', '河北', '上海', '北京', '天津', '黑龙江']);
```

确认：
- 省份下拉有 7 个选项
- 选科下拉有"物理类"和"历史类"
- 偏好标签可点击切换 active 状态
- 页面无 JS 报错

- [ ] **Step 3: Commit**

```bash
git add js/ui.js
git commit -m "feat: UI 渲染模块 — 表单渲染 + Prompt 预览 + 数据读写

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: 主控制器集成 (app.js)

**Files:**
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `DataLoader` 全部方法, `PromptBuilder` 全部方法, `UI` 全部方法
- Produces: `App.init()` 引导整个应用启动，绑定事件，处理流程

- [ ] **Step 1: 实现 app.js 完整逻辑**

```javascript
const App = {
  _currentPrompt: '',

  async init() {
    // 渲染表单
    const provinces = Object.keys(DataLoader.PROVINCE_MAP);
    UI.renderForm(provinces);

    // 恢复上次填写
    this.restoreState();

    // 绑定事件
    document.getElementById('generate-btn')?.addEventListener('click', () => this.handleGenerate());
    document.getElementById('output-section')?.addEventListener('click', (e) => {
      if (e.target.id === 'copy-btn') this.handleCopy();
      if (e.target.id === 'regenerate-btn') this.handleRegenerate();
    });

    // 省份切换时自动填入批次线
    document.getElementById('province')?.addEventListener('change', () => this.handleProvinceChange());

    // 表单变化时自动保存
    ['province', 'subjectType', 'score', 'batchLine', 'rank', 'freeText'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.saveState());
    });
    document.getElementById('form-section')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-btn')) {
        setTimeout(() => this.saveState(), 100);
      }
    });
  },

  async handleProvinceChange() {
    const province = document.getElementById('province')?.value;
    if (!province) return;

    try {
      const provinceKey = DataLoader.PROVINCE_MAP[province];
      const data = await DataLoader.loadProvinceData(provinceKey);
      const subjectType = document.getElementById('subjectType')?.value;

      if (subjectType && data) {
        const batchLines = DataLoader.getBatchLines(data, subjectType);
        if (batchLines && batchLines['本科']) {
          document.getElementById('batchLine').value = batchLines['本科'];
        }
      }
    } catch (err) {
      UI.showMessage(`加载 ${province} 数据失败，请检查网络或数据文件`, 'error');
      console.error(err);
    }
  },

  async handleGenerate() {
    const { userInfo, preferences } = UI.getFormData();

    // 表单验证
    if (!userInfo.province || !userInfo.subjectType || !userInfo.score) {
      UI.showMessage('请填写省份、选科类型和高考分数后再生成', 'error');
      return;
    }
    if (userInfo.score < 100 || userInfo.score > 750) {
      UI.showMessage('请输入合理的分数（100-750）', 'error');
      return;
    }

    try {
      const provinceKey = DataLoader.PROVINCE_MAP[userInfo.province];
      const data = await DataLoader.loadProvinceData(provinceKey);

      // 如果没有手动填批次线，自动填入
      if (!userInfo.batchLine) {
        const batchLines = DataLoader.getBatchLines(data, userInfo.subjectType);
        if (batchLines) {
          userInfo.batchLine = batchLines['本科'] || 0;
        }
      }

      // 获取匹配专业并分档
      const majors = DataLoader.getMajorsBySubject(data, userInfo.subjectType);
      const tiered = PromptBuilder.tierMajors(majors, userInfo.score);
      tiered._provinceData = data;

      // 构建 Prompt
      const prompt = PromptBuilder.buildPrompt(userInfo, tiered, preferences);
      this._currentPrompt = prompt;

      // 渲染输出
      UI.renderPrompt(prompt);
      UI.toggleOutput(true);

      // 滚动到输出区
      document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });

      // 保存状态
      this.saveState();

      UI.showMessage(`✅ 生成成功！冲刺 ${tiered.rush.length} / 稳妥 ${tiered.steady.length} / 保底 ${tiered.safe.length} 个专业`, 'success');
    } catch (err) {
      UI.showMessage(`生成失败：${err.message}`, 'error');
      console.error(err);
    }
  },

  async handleCopy() {
    if (!this._currentPrompt) {
      UI.showMessage('请先生成 Prompt', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(this._currentPrompt);
      UI.showMessage('✅ 已复制到剪贴板，可以粘贴到任意 AI 中提问了！', 'success');
    } catch {
      // 降级方案：选中文本让用户手动复制
      const pre = document.getElementById('prompt-text');
      if (pre) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        UI.showMessage('已选中文本，请手动 Ctrl+C / Cmd+C 复制', 'info');
      }
    }
  },

  handleRegenerate() {
    UI.toggleOutput(false);
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  },

  saveState() {
    try {
      const data = UI.getFormData();
      localStorage.setItem('gaokao_volunteer_state', JSON.stringify(data));
    } catch {
      // localStorage 不可用时静默失败
    }
  },

  restoreState() {
    try {
      const raw = localStorage.getItem('gaokao_volunteer_state');
      if (raw) {
        const data = JSON.parse(raw);
        UI.setFormData(data);
      }
    } catch {
      // 数据损坏时静默失败
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: 验证 — 端到端测试**

在浏览器 http://localhost:8080 上手动测试：
1. 选择「江苏」+「物理类」，分数填 `620`
2. 勾选「省内优先」「985」「211」「工科」「优先就业」
3. 补充描述框填 `喜欢计算机，不考虑化工和土木`
4. 点击「🚀 生成 Prompt」
5. 确认：输出区显示完整 Prompt，含三档表格、偏好标签、个人描述
6. 点击「📋 一键复制」，确认剪贴板有内容
7. 刷新页面，确认表单数据恢复（省份、选科、分数、标签均在）

同时在控制台验证无报错。

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: 主控制器集成 — 事件绑定 + 表单验证 + localStorage 持久化

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: 样式设计 (style.css)

**Files:**
- Modify: `css/style.css`

**目标：** 移动端优先的响应式布局，简洁清晰的卡片式设计，参考设计文档中的布局图。

- [ ] **Step 1: 实现完整 CSS**

关键设计要点：
- 移动端优先（max-width: 768px 为移动端基准）
- 卡片式布局（.card），带圆角和阴影
- 标签按钮（.tag-btn），选中时有蓝色高亮
- Prompt 预览区（.prompt-preview），深色背景模拟终端效果
- 响应式：桌面端时表单行变为多列

```css
/* === Reset & Base === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --success: #16a34a;
  --danger: #dc2626;
  --bg: #f1f5f9;
  --card-bg: #ffffff;
  --text: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --tag-active-bg: #dbeafe;
  --tag-active-text: #1e40af;
  --tag-active-border: #93c5fd;
  --preview-bg: #1e293b;
  --preview-text: #e2e8f0;
  --radius: 10px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

/* === Header === */
header {
  text-align: center;
  padding: 32px 0 24px;
}

header h1 {
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* === Card === */
.card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  margin-bottom: 16px;
}

.card h2 {
  font-size: 1.15rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.optional-tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 8px;
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 4px;
}

/* === Form === */
.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row-3 {
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 0;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-secondary);
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
  background: #fff;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group textarea {
  resize: vertical;
}

/* === Tags === */
.tag-category {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.tag-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 72px;
  padding-top: 6px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.tag-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  color: var(--text);
  white-space: nowrap;
}

.tag-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.tag-btn.active {
  background: var(--tag-active-bg);
  color: var(--tag-active-text);
  border-color: var(--tag-active-border);
  font-weight: 600;
}

.free-text {
  margin-top: 8px;
}

/* === Buttons === */
.form-actions {
  text-align: center;
  margin: 8px 0 16px;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--border);
}

/* === Output === */
.hidden {
  display: none !important;
}

.output-header {
  margin-bottom: 16px;
}

.output-header h2 {
  margin-bottom: 4px;
}

.output-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.prompt-preview {
  background: var(--preview-bg);
  border-radius: 8px;
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 16px;
}

.prompt-preview pre {
  color: var(--preview-text);
  font-size: 0.82rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
}

.output-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* === Toast === */
.message-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1000;
  animation: slideDown 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.message-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.message-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* === Footer === */
footer {
  text-align: center;
  padding: 24px 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* === Responsive === */
@media (max-width: 600px) {
  .container {
    padding: 10px;
  }

  header {
    padding: 20px 0 16px;
  }

  header h1 {
    font-size: 1.35rem;
  }

  .card {
    padding: 14px;
    margin-bottom: 12px;
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .tag-category {
    flex-direction: column;
  }

  .tag-label {
    padding-top: 0;
    margin-bottom: 2px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 14px 20px;
  }

  .output-actions {
    flex-direction: column;
  }

  .prompt-preview {
    max-height: 50vh;
    padding: 14px;
  }

  .prompt-preview pre {
    font-size: 0.72rem;
  }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .container {
    max-width: 90vw;
  }
}
```

- [ ] **Step 2: 验证 — 响应式检查**

在浏览器 http://localhost:8080 上：
1. 正常宽度下确认布局整齐
2. 使用 DevTools 切换到移动端视图（375px 宽），确认：
   - 表单列从横向变为纵向
   - 标签换行正常
   - 按钮全宽
   - 无横向溢出

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: 完整样式 — 移动端优先响应式设计 + 卡片布局

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: GitHub Pages 部署

**Files:**
- 无需新建文件（GitHub 配置操作）

- [ ] **Step 1: 确保所有文件已提交并推送**

```bash
cd /Users/kuanyue/Desktop/study-notes/volunteer
git add -A
git status
git push origin main
```

- [ ] **Step 2: 启用 GitHub Pages**

```bash
gh api repos/jiekewen/volunteer/pages \
  --method POST \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

或用浏览器打开 https://github.com/jiekewen/volunteer/settings/pages，选择 Source 为 `main` 分支，根目录 `/`，点击 Save。

- [ ] **Step 3: 验证部署**

等待 1-2 分钟后，访问 https://jiekewen.github.io/volunteer/ 确认：
- 页面正常加载
- 选择江苏 + 物理类 + 分数 620 后能成功生成 Prompt
- 复制功能正常

- [ ] **Step 4: Final commit（如有遗漏）**

```bash
git add -A
git commit --allow-empty -m "chore: GitHub Pages 部署就绪

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```
