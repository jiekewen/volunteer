// UI 渲染模块 — 负责表单渲染和结果展示

const PREFERENCE_TAGS = {
  region:       { label: '地域倾向', options: ['省内优先', '可以出省', '一线城市优先', '不限'] },
  schoolLevel:  { label: '学校层次', options: ['985', '211', '双一流', '公办本科', '不限'] },
  majorDirection: { label: '专业方向', options: ['工科', '医学', '师范', '经管', '法学', '理学', '农学', '文学', '不限'] },
  careerGoal:   { label: '发展倾向', options: ['优先就业', '优先考研', '优先考公', '出国深造'] }
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
            <select id="province"><option value="">请选择省份</option>${provinceList.map(p => `<option value="${p}">${p}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label for="subjectType">选科类型</label>
            <select id="subjectType"><option value="">请选择</option><option value="物理类">物理类</option><option value="历史类">历史类</option></select>
          </div>
        </div>
        <div class="form-row form-row-3">
          <div class="form-group"><label for="score">高考分数</label><input type="number" id="score" placeholder="如 620" min="0" max="750"></div>
          <div class="form-group"><label for="batchLine">批次线（本科线）</label><input type="number" id="batchLine" placeholder="自动填入/手动修改" min="0" max="750"></div>
          <div class="form-group"><label for="rank">全省位次（可选）</label><input type="number" id="rank" placeholder="如 5000" min="1"></div>
        </div>
      </div>
      <div class="card">
        <h2>🎯 偏好设置 <span class="optional-tag">可选</span></h2>
        ${Object.entries(PREFERENCE_TAGS).map(([key, cat]) => `
          <div class="tag-category">
            <span class="tag-label">${cat.label}：</span>
            <div class="tag-group" data-category="${key}">${cat.options.map(opt => `<button type="button" class="tag-btn" data-category="${key}" data-value="${opt}">${opt}</button>`).join('')}</div>
          </div>`).join('')}
        <div class="form-group free-text">
          <label for="freeText">个人补充描述</label>
          <textarea id="freeText" rows="3" placeholder="例如：我喜欢数学但不想学纯理论，家人希望我以后考公，不想到太冷的地方..."></textarea>
        </div>
      </div>
      <div class="form-actions"><button type="button" id="generate-btn" class="btn-primary">🚀 生成 Prompt</button></div>
    `;
    this._bindTagEvents();
  },

  _bindTagEvents() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', () => btn.classList.toggle('active'));
    });
  },

  getFormData() {
    const getEl = id => document.getElementById(id);
    const province = getEl('province')?.value || '';
    const subjectType = getEl('subjectType')?.value || '';
    const score = parseInt(getEl('score')?.value) || 0;
    const batchLine = parseInt(getEl('batchLine')?.value) || 0;
    const rank = parseInt(getEl('rank')?.value) || 0;
    const freeText = getEl('freeText')?.value || '';
    const tags = {};
    document.querySelectorAll('.tag-group').forEach(group => {
      const selected = [];
      group.querySelectorAll('.tag-btn.active').forEach(btn => selected.push(btn.dataset.value));
      tags[group.dataset.category] = selected;
    });
    return { userInfo: { province, subjectType, score, batchLine, rank }, preferences: { tags, freeText } };
  },

  setFormData(data) {
    if (!data?.userInfo) return;
    const { userInfo, preferences } = data;
    const setVal = (id, val) => { if (val) { const el = document.getElementById(id); if (el) el.value = val; } };
    setVal('province', userInfo.province);
    setVal('subjectType', userInfo.subjectType);
    setVal('score', userInfo.score);
    setVal('batchLine', userInfo.batchLine);
    setVal('rank', userInfo.rank);
    if (preferences) {
      setVal('freeText', preferences.freeText);
      if (preferences.tags) {
        setTimeout(() => {
          for (const [cat, vals] of Object.entries(preferences.tags)) {
            vals.forEach(v => {
              const btn = document.querySelector(`.tag-btn[data-category="${cat}"][data-value="${v}"]`);
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
        <div class="output-header"><h2>📝 生成的 Prompt</h2><span class="output-hint">可直接复制粘贴到 ChatGPT / Claude / Gemini 等任意 AI</span></div>
        <div class="prompt-preview"><pre id="prompt-text">${this._escapeHtml(promptText)}</pre></div>
        <div class="output-actions">
          <button type="button" id="copy-btn" class="btn-primary">📋 一键复制</button>
          <button type="button" id="regenerate-btn" class="btn-secondary">🔄 重新生成</button>
        </div>
      </div>`;
  },

  toggleOutput(visible) {
    const s = document.getElementById('output-section');
    if (s) s.classList.toggle('hidden', !visible);
  },

  showMessage(msg, type) {
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
