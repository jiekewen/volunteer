// 主控制器 — 事件绑定和流程控制
const App = {
  _currentPrompt: '',

  async init() {
    const provinces = Object.keys(DataLoader.PROVINCE_MAP);
    UI.renderForm(provinces);

    document.getElementById('generate-btn')?.addEventListener('click', () => this.handleGenerate());
    document.getElementById('output-section')?.addEventListener('click', (e) => {
      if (e.target.id === 'copy-btn') this.handleCopy();
      if (e.target.id === 'download-pdf-btn') this.handleDownloadPDF();
      if (e.target.id === 'download-excel-btn') this.handleDownloadExcel();
      if (e.target.id === 'regenerate-btn') this.handleRegenerate();
    });
    document.getElementById('province')?.addEventListener('change', () => this.handleProvinceChange());
    document.getElementById('subjectType')?.addEventListener('change', () => this.handleProvinceChange());
  },

  async handleProvinceChange() {
    const province = document.getElementById('province')?.value;
    const subjectType = document.getElementById('subjectType')?.value;
    if (!province || !subjectType) return;
    try {
      const provinceKey = DataLoader.PROVINCE_MAP[province];
      if (!provinceKey) return;
      const data = await DataLoader.loadProvinceData(provinceKey);
      const batchLines = DataLoader.getBatchLines(data, subjectType);
      if (batchLines && batchLines['本科']) {
        document.getElementById('batchLine').value = batchLines['本科'];
      }
    } catch (err) {
      console.error('自动填入批次线失败:', err);
    }
  },

  async handleGenerate() {
    const { userInfo, preferences } = UI.getFormData();
    if (!userInfo.province) { UI.showMessage('请选择省份', 'error'); return; }
    if (!userInfo.subjectType) { UI.showMessage('请选择选科类型', 'error'); return; }
    if (!userInfo.score || userInfo.score < 100 || userInfo.score > 750) {
      UI.showMessage('请输入合理的高考分数（100-750）', 'error'); return;
    }
    try {
      const provinceKey = DataLoader.PROVINCE_MAP[userInfo.province];
      if (!provinceKey) { UI.showMessage('所选省份暂无数据', 'error'); return; }
      const data = await DataLoader.loadProvinceData(provinceKey);

      if (!userInfo.batchLine) {
        const bl = DataLoader.getBatchLines(data, userInfo.subjectType);
        if (bl) userInfo.batchLine = bl['本科'] || 0;
      }

      const majors = DataLoader.getMajorsBySubject(data, userInfo.subjectType);
      if (majors.length === 0) {
        UI.showMessage(`${userInfo.province}暂无${userInfo.subjectType}的录取数据`, 'error'); return;
      }

      const tiered = PromptBuilder.tierMajors(majors, userInfo.score);
      tiered._provinceData = data;
      const prompt = PromptBuilder.buildPrompt(userInfo, tiered, preferences);
      this._currentPrompt = prompt;

      UI.renderPrompt(prompt);
      UI.toggleOutput(true);
      document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });
      UI.showMessage(`✅ 生成成功！冲刺 ${tiered.rush.length} / 稳妥 ${tiered.steady.length} / 保底 ${tiered.safe.length} 个专业`, 'success');
    } catch (err) {
      UI.showMessage(`生成失败：${err.message}`, 'error');
      console.error(err);
    }
  },

  async handleCopy() {
    if (!this._currentPrompt) { UI.showMessage('请先生成 Prompt', 'error'); return; }
    try {
      await navigator.clipboard.writeText(this._currentPrompt);
      UI.showMessage('✅ 已复制到剪贴板，可以粘贴到任意 AI 中提问了！', 'success');
    } catch {
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

  handleDownloadPDF() {
    if (!this._currentPrompt) {
      UI.showMessage('请先生成 Prompt', 'error');
      return;
    }
    // 将 prompt 渲染到打印区并触发打印（用户选择"另存为 PDF"）
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = `
      <div class="print-header">
        <h1>高考志愿填报分析报告</h1>
        <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <pre class="print-content">${this._escapeHtml(this._currentPrompt)}</pre>
    `;
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
    UI.showMessage('请在打印对话框中选择「另存为 PDF」', 'info');
  },

  handleDownloadExcel() {
    if (!this._currentPrompt) {
      UI.showMessage('请先生成 Prompt', 'error');
      return;
    }
    // 从 Prompt 中提取 markdown 表格，转为 CSV 下载
    const tables = this._extractTables(this._currentPrompt);
    if (tables.length === 0) {
      UI.showMessage('未找到表格数据可导出', 'error');
      return;
    }

    // 构建 CSV：每个表格之间用空行分隔，加上表头标注
    const csvParts = [];
    for (const table of tables) {
      csvParts.push(table.title);
      csvParts.push(table.header.join(','));
      for (const row of table.rows) {
        // CSV 转义：包含逗号或引号的字段用双引号包裹
        csvParts.push(row.map(cell => {
          const str = String(cell).replace(/"/g, '""');
          return /[,"\n]/.test(str) ? `"${str}"` : str;
        }).join(','));
      }
      csvParts.push(''); // 空行分隔
    }

    // 添加 BOM 以支持 Excel 正确识别中文
    const BOM = '﻿';
    const csvContent = BOM + csvParts.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `高考志愿填报数据_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.showMessage('✅ Excel/CSV 文件已下载，可直接用 Excel 打开', 'success');
  },

  // 从 markdown 文本中提取表格
  _extractTables(text) {
    const tables = [];
    const lines = text.split('\n');

    let i = 0;
    while (i < lines.length) {
      // 查找 markdown 表格头部行（以 | 开头）
      if (lines[i].startsWith('|') && lines[i].includes('---')) {
        // 找到了分隔行，往前找表头
        let headerLine = i - 1;
        while (headerLine >= 0 && lines[headerLine].startsWith('|')) {
          headerLine--;
        }
        headerLine++;

        // 往前找标题（### 开头的行）
        let titleLine = headerLine - 1;
        while (titleLine >= 0 && !lines[titleLine].startsWith('###')) {
          titleLine--;
        }
        const title = titleLine >= 0
          ? lines[titleLine].replace(/^###\s*/, '').replace(/\s*$/, '')
          : '录取数据';

        const header = lines[headerLine]
          .split('|').map(s => s.trim()).filter(s => s);

        // 跳过 header 行和分隔行
        let rowStart = i + 1;
        const rows = [];
        while (rowStart < lines.length && lines[rowStart].startsWith('|')) {
          const row = lines[rowStart]
            .split('|').map(s => s.trim()).filter(s => s);
          if (row.length > 0) rows.push(row);
          rowStart++;
        }

        if (rows.length > 0) {
          tables.push({ title, header, rows });
        }
        i = rowStart;
      } else {
        i++;
      }
    }
    return tables;
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  handleRegenerate() {
    UI.toggleOutput(false);
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  },

};

document.addEventListener('DOMContentLoaded', () => App.init());
