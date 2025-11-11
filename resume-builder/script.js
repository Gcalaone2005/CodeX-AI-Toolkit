/* ===============================
   CodeX AI Resume Builder Script
   =============================== */

// Escape helper
function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// === DOM References ===
const refs = {
  name: document.getElementById('name'),
  title: document.getElementById('title'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  location: document.getElementById('location'),
  summary: document.getElementById('summary'),
  skillInput: document.getElementById('skillInput'),
  skillsChips: document.getElementById('skillsChips'),
  experienceList: document.getElementById('experienceList'),
  educationList: document.getElementById('educationList'),
  addExpBtn: document.getElementById('addExpBtn'),
  addEduBtn: document.getElementById('addEduBtn'),
  templateSelect: document.getElementById('templateSelect'),
  accentSelect: document.getElementById('accentSelect'),
  customAccentPicker: document.getElementById('customAccentPicker'),
  themeSelect: document.getElementById('themeSelect'),
  saveBtn: document.getElementById('saveBtn'),
  loadBtn: document.getElementById('loadBtn'),
  clearBtn: document.getElementById('clearBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  exportBundleBtn: document.getElementById('exportBundleBtn'),
  status: document.getElementById('status'),
  previewContainer: document.getElementById('previewContainer'),
  pv_name: document.getElementById('pv_name'),
  pv_title: document.getElementById('pv_title'),
  pv_contact: document.getElementById('pv_contact'),
  pv_location: document.getElementById('pv_location'),
  pv_summary: document.getElementById('pv_summary'),
  pv_experience: document.getElementById('pv_experience'),
  pv_education: document.getElementById('pv_education'),
  pv_skills: document.getElementById('pv_skills'),
  pv_photo: document.getElementById('pv_photo'),
  photoInput: document.getElementById('photoInput'),
  photoPreview: document.getElementById('photoPreview'),
  removePhotoBtn: document.getElementById('removePhotoBtn'),
  globalStatus: document.getElementById('globalStatus'),
  statusText: document.getElementById('statusText')
};

// === App State ===
const state = {
  name: '', title: '', email: '', phone: '', location: '',
  summary: '', skills: [], experience: [], education: [],
  photo: null,
  customAccent: '#2563eb',
  theme: 'light',
  sectionVisibility: { summary: true, experience: true, education: true, skills: true }
};

// === Basic Listeners ===
['name', 'title', 'email', 'phone', 'location', 'summary'].forEach(k => {
  refs[k].addEventListener('input', e => {
    state[k] = e.target.value;
    renderPreview();
  });
});

// === Skills Input ===
refs.skillInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addSkillFromInput();
  }
});
refs.skillInput.addEventListener('blur', addSkillFromInput);

function addSkillFromInput() {
  const v = refs.skillInput.value.trim();
  if (!v) return;
  const parts = v.split(',').map(s => s.trim()).filter(Boolean);
  parts.forEach(p => { if (!state.skills.includes(p)) state.skills.push(p); });
  refs.skillInput.value = '';
  renderSkills();
  renderPreview();
}
function renderSkills() {
  refs.skillsChips.innerHTML = '';
  state.skills.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.textContent = s;
    el.addEventListener('click', () => {
      state.skills.splice(idx, 1);
      renderSkills();
      renderPreview();
    });
    refs.skillsChips.appendChild(el);
  });
}

// === Experience & Education Blocks ===
function createExperienceItem(data = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-item';
  wrapper.innerHTML = `
    <button class="remove">✕</button>
    <label>Job Title <input type="text" class="exp-role" value="${escapeHtml(data.role || '')}"></label>
    <label>Company <input type="text" class="exp-company" value="${escapeHtml(data.company || '')}"></label>
    <div style="display:flex;gap:8px">
      <input type="text" class="exp-start" value="${escapeHtml(data.start || '')}" placeholder="Start (e.g. Jan 2022)">
      <input type="text" class="exp-end" value="${escapeHtml(data.end || '')}" placeholder="End (e.g. Present)">
    </div>
    <label>Bullets <textarea class="exp-bullets" placeholder="- Achieved ...">${escapeHtml((data.bullets || []).join('\n'))}</textarea></label>
  `;
  wrapper.querySelector('.remove').addEventListener('click', () => {
    wrapper.remove(); syncStateFromDOM(); renderPreview();
  });
  wrapper.querySelectorAll('input,textarea').forEach(i =>
    i.addEventListener('input', () => { syncStateFromDOM(); renderPreview(); })
  );
  return wrapper;
}

function createEducationItem(data = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-item';
  wrapper.innerHTML = `
    <button class="remove">✕</button>
    <label>Degree <input type="text" class="edu-degree" value="${escapeHtml(data.degree || '')}"></label>
    <label>Institution <input type="text" class="edu-institution" value="${escapeHtml(data.institution || '')}"></label>
    <div style="display:flex;gap:8px">
      <input type="text" class="edu-start" value="${escapeHtml(data.start || '')}" placeholder="Start (e.g. 2018)">
      <input type="text" class="edu-end" value="${escapeHtml(data.end || '')}" placeholder="End (e.g. 2022)">
    </div>
    <label>Notes <textarea class="edu-notes">${escapeHtml(data.notes || '')}</textarea></label>
  `;
  wrapper.querySelector('.remove').addEventListener('click', () => {
    wrapper.remove(); syncStateFromDOM(); renderPreview();
  });
  wrapper.querySelectorAll('input,textarea').forEach(i =>
    i.addEventListener('input', () => { syncStateFromDOM(); renderPreview(); })
  );
  return wrapper;
}

refs.addExpBtn.addEventListener('click', () => {
  refs.experienceList.appendChild(createExperienceItem());
});
refs.addEduBtn.addEventListener('click', () => {
  refs.educationList.appendChild(createEducationItem());
});

function syncStateFromDOM() {
  const exNodes = Array.from(refs.experienceList.querySelectorAll('.list-item'));
  state.experience = exNodes.map(n => ({
    role: n.querySelector('.exp-role').value.trim(),
    company: n.querySelector('.exp-company').value.trim(),
    start: n.querySelector('.exp-start').value.trim(),
    end: n.querySelector('.exp-end').value.trim(),
    bullets: n.querySelector('.exp-bullets').value.split('\n').map(s => s.trim()).filter(Boolean)
  }));
  const edNodes = Array.from(refs.educationList.querySelectorAll('.list-item'));
  state.education = edNodes.map(n => ({
    degree: n.querySelector('.edu-degree').value.trim(),
    institution: n.querySelector('.edu-institution').value.trim(),
    start: n.querySelector('.edu-start').value.trim(),
    end: n.querySelector('.edu-end').value.trim(),
    notes: n.querySelector('.edu-notes').value.trim()
  }));
}

// === Photo Upload ===
refs.photoInput.addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.photo = ev.target.result;
    renderPhotoPreview();
    renderPreview();
  };
  reader.readAsDataURL(f);
});
refs.removePhotoBtn.addEventListener('click', () => {
  state.photo = null;
  refs.photoInput.value = '';
  renderPhotoPreview();
  renderPreview();
});
function renderPhotoPreview() {
  refs.photoPreview.innerHTML = '';
  if (state.photo) {
    const img = document.createElement('img');
    img.src = state.photo;
    refs.photoPreview.appendChild(img);
  } else refs.photoPreview.textContent = 'No photo selected.';
}

// === Section Toggles & Titles ===
['Summary', 'Experience', 'Education', 'Skills'].forEach(sec => {
  const chk = document.getElementById(`toggle${sec}`);
  const title = document.getElementById(`title${sec}`);
  if (chk) chk.addEventListener('change', () => {
    state.sectionVisibility[sec.toLowerCase()] = chk.checked;
    renderPreview();
  });
  if (title) title.addEventListener('input', renderPreview);
});

// === AI Suggestion & Auto-Fill ===
const aiData = {
  developer: {
    summary: [
      "Creative front-end developer passionate about modern UI and efficiency.",
      "Full-stack engineer focused on scalability and performance."
    ],
    skills: ["JavaScript", "React", "Node.js", "HTML", "CSS", "Git"],
  }
};

document.getElementById('aiSuggestBtn').addEventListener('click', () => {
  const role = refs.title.value.toLowerCase();
  let key = "developer";
  const data = aiData[key];
  const aiBox = document.getElementById('aiSuggestionBox');
  const aiList = document.getElementById('aiSuggestionsList');
  aiList.innerHTML = '';
  data.summary.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    li.addEventListener('click', () => {
      refs.summary.value = s;
      state.summary = s;
      aiBox.style.display = 'none';
      renderPreview();
    });
    aiList.appendChild(li);
  });
  aiBox.style.display = 'block';
});

// === AI Auto-Fill ===
document.getElementById('aiAutoFillBtn').addEventListener('click', () => {
  const data = {
    summary: "Full-stack developer building efficient, scalable web apps.",
    skills: ["React", "Node.js", "Express", "MongoDB", "Tailwind"],
    experience: [{
      role: "Front-End Developer",
      company: "TechNova",
      start: "2022",
      end: "Present",
      bullets: ["Built responsive UIs", "Improved load times by 30%"]
    }],
    education: [{
      degree: "B.Sc. Computer Science",
      institution: "Tech University",
      start: "2018",
      end: "2021",
      notes: "Graduated with distinction"
    }]
  };
  Object.assign(state, data);
  refs.summary.value = data.summary;
  state.skills = data.skills;
  renderSkills();
  refs.experienceList.innerHTML = '';
  refs.educationList.innerHTML = '';
  data.experience.forEach(e => refs.experienceList.appendChild(createExperienceItem(e)));
  data.education.forEach(e => refs.educationList.appendChild(createEducationItem(e)));
  renderPreview();
  refs.status.textContent = "✨ AI Auto-Fill complete.";
  setTimeout(() => refs.status.textContent = '', 2000);
});

// === Theme & Accent ===
refs.customAccentPicker.addEventListener('input', (e) => {
  state.customAccent = e.target.value;
  document.documentElement.style.setProperty('--custom-accent', state.customAccent);
});
refs.themeSelect.addEventListener('change', () => {
  state.theme = refs.themeSelect.value;
  document.body.className = `theme-${state.theme}`;
});

// === Render Preview ===
function renderPreview() {
  refs.pv_name.textContent = state.name || 'Your name';
  refs.pv_title.textContent = state.title || 'Job title';
  refs.pv_contact.textContent = [state.email, state.phone].filter(Boolean).join(' • ') || 'email • phone';
  refs.pv_location.textContent = state.location || '';
  refs.pv_summary.textContent = state.summary || 'Short summary about your experience and focus.';
  refs.pv_photo.innerHTML = state.photo ? `<img src="${state.photo}" alt="photo">` : '';

  // Toggle sections
  document.querySelector('.res-summary-section').style.display = state.sectionVisibility.summary ? '' : 'none';
  document.querySelector('.res-experience-section').style.display = state.sectionVisibility.experience ? '' : 'none';
  document.querySelector('.res-education-section').style.display = state.sectionVisibility.education ? '' : 'none';
  document.querySelector('.res-skills-section').style.display = state.sectionVisibility.skills ? '' : 'none';

  // Custom section titles
  document.querySelector('.res-summary-section h4').textContent = document.getElementById('titleSummary').value;
  document.querySelector('.res-experience-section h4').textContent = document.getElementById('titleExperience').value;
  document.querySelector('.res-education-section h4').textContent = document.getElementById('titleEducation').value;
  document.querySelector('.res-skills-section h4').textContent = document.getElementById('titleSkills').value;

  // Experience
  refs.pv_experience.innerHTML = '';
  state.experience.forEach(exp => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${escapeHtml(exp.role)}</strong> - ${escapeHtml(exp.company)}<br><span class="muted-inline">${escapeHtml(exp.start)} - ${escapeHtml(exp.end)}</span>`;
    exp.bullets.forEach(b => {
      const p = document.createElement('div');
      p.className = 'bullet';
      p.textContent = b;
      div.appendChild(p);
    });
    refs.pv_experience.appendChild(div);
  });

  // Education
  refs.pv_education.innerHTML = '';
  state.education.forEach(ed => {
    const node = document.createElement('div');
    node.innerHTML = `<strong>${escapeHtml(ed.degree)}</strong><div>${escapeHtml(ed.institution)}</div><div class="muted-inline">${escapeHtml(ed.start)} - ${escapeHtml(ed.end)}</div><div>${escapeHtml(ed.notes)}</div>`;
    refs.pv_education.appendChild(node);
  });

  // Skills
  refs.pv_skills.innerHTML = '';
  state.skills.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = s;
    refs.pv_skills.appendChild(chip);
  });
}

// === Save / Load / Clear ===
refs.saveBtn.addEventListener('click', () => {
  localStorage.setItem('codex_resume', JSON.stringify(state));
  refs.status.textContent = '💾 Draft saved.';
  setTimeout(() => refs.status.textContent = '', 2000);
});
refs.loadBtn.addEventListener('click', () => {
  const data = JSON.parse(localStorage.getItem('codex_resume') || '{}');
  Object.assign(state, data);
  refs.name.value = state.name;
  refs.title.value = state.title;
  refs.email.value = state.email;
  refs.phone.value = state.phone;
  refs.location.value = state.location;
  refs.summary.value = state.summary;
  renderSkills();
  renderPreview();
});
refs.clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all fields?')) return;
  Object.keys(state).forEach(k => {
    if (Array.isArray(state[k])) state[k] = [];
    else if (typeof state[k] === 'object') Object.keys(state[k]).forEach(sub => state[k][sub] = true);
    else state[k] = '';
  });
  document.querySelectorAll('input,textarea').forEach(i => i.value = '');
  renderSkills();
  renderPreview();
});

// === PDF Export ===
refs.downloadBtn.addEventListener('click', async () => {
  showGlobalStatus('Generating PDF...');
  const opt = {
    margin: 14,
    filename: `${(state.name || 'resume')}_CodeX.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };
  await html2pdf().set(opt).from(document.getElementById('resumePreview')).save();
  hideGlobalStatus();
});

// === Export Bundle ===
refs.exportBundleBtn.addEventListener('click', async () => {
  showGlobalStatus('Preparing ZIP...');
  const zip = new JSZip();
  const pdfBlob = await html2pdf().from(document.getElementById('resumePreview')).outputPdf('blob');
  zip.file(`${state.name || 'resume'}.pdf`, pdfBlob);
  zip.file('resume_data.json', JSON.stringify(state, null, 2));
  zip.file('index.html', document.documentElement.outerHTML);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `CodeX_Resume_Bundle_${state.name || 'User'}.zip`);
  hideGlobalStatus();
});

// === Global Status UI ===
function showGlobalStatus(text) {
  refs.globalStatus.hidden = false;
  refs.statusText.textContent = text;
}
function hideGlobalStatus() {
  refs.globalStatus.hidden = true;
}

// === Init ===
(function init() {
  refs.experienceList.appendChild(createExperienceItem());
  refs.educationList.appendChild(createEducationItem());
  renderPreview();
})();
