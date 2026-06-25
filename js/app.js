// 主控制器 — 事件绑定和流程控制
const App = {
  _currentPrompt: '',

  async init() {
    const provinces = Object.keys(DataLoader.PROVINCE_MAP);
    UI.renderForm(provinces);
    this.restoreState();

    document.getElementById('generate-btn')?.addEventListener('click', () => this.handleGenerate());
    document.getElementById('output-section')?.addEventListener('click', (e) => {
      if (e.target.id === 'copy-btn') this.handleCopy();
      if (e.target.id === 'regenerate-btn') this.handleRegenerate();
    });
    document.getElementById('province')?.addEventListener('change', () => this.handleProvinceChange());
    document.getElementById('subjectType')?.addEventListener('change', () => this.handleProvinceChange());

    ['province', 'subjectType', 'score', 'batchLine', 'rank', 'freeText'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.saveState());
    });
    document.getElementById('form-section')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-btn')) setTimeout(() => this.saveState(), 100);
    });
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
      this.saveState();
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

  handleRegenerate() {
    UI.toggleOutput(false);
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  },

  saveState() {
    try { localStorage.setItem('gaokao_volunteer_state', JSON.stringify(UI.getFormData())); } catch {}
  },

  restoreState() {
    try {
      const raw = localStorage.getItem('gaokao_volunteer_state');
      if (raw) UI.setFormData(JSON.parse(raw));
    } catch {}
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
