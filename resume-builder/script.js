// script.js - behavior for CodeX Resume Builder (templates + PDF export)

// Minimal escape helper
function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// state
const state = { name:'', title:'', email:'', phone:'', location:'', summary:'', skills:[], experience:[], education:[] };

// DOM refs
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
  saveBtn: document.getElementById('saveBtn'),
  loadBtn: document.getElementById('loadBtn'),
  clearBtn: document.getElementById('clearBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  status: document.getElementById('status'),
  previewContainer: document.getElementById('previewContainer'),
  pv_name: document.getElementById('pv_name'),
  pv_title: document.getElementById('pv_title'),
  pv_contact: document.getElementById('pv_contact'),
  pv_location: document.getElementById('pv_location'),
  pv_summary: document.getElementById('pv_summary'),
  pv_experience: document.getElementById('pv_experience'),
  pv_education: document.getElementById('pv_education'),
  pv_skills: document.getElementById('pv_skills')
};

// add input listeners to basic fields
['name','title','email','phone','location','summary'].forEach(k=>{
  refs[k].addEventListener('input', e=>{ state[k]=e.target.value; renderPreview(); });
});

// Skills input: add on Enter or comma, and on blur
refs.skillInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addSkillFromInput();
  }
});
refs.skillInput.addEventListener('blur', addSkillFromInput);

function addSkillFromInput(){
  const v = refs.skillInput.value.trim();
  if (!v) return;
  const parts = v.split(',').map(s=>s.trim()).filter(Boolean);
  parts.forEach(p => { if (!state.skills.includes(p)) state.skills.push(p); });
  refs.skillInput.value = '';
  renderSkills();
  renderPreview();
}
function renderSkills(){
  refs.skillsChips.innerHTML = '';
  state.skills.forEach((s, idx)=>{
    const el = document.createElement('div'); el.className='chip'; el.textContent = s;
    el.addEventListener('click', ()=>{ state.skills.splice(idx,1); renderSkills(); renderPreview(); });
    refs.skillsChips.appendChild(el);
  });
}

// Dynamic experience/education items
function createExperienceItem(data={}){
  const wrapper = document.createElement('div'); wrapper.className='list-item';
  wrapper.innerHTML = `
    <button class="remove" aria-label="Remove">✕</button>
    <label>Job title <input type="text" class="exp-role" value="${escapeHtml(data.role||'')}" placeholder="Senior Developer"></label>
    <label>Company <input type="text" class="exp-company" value="${escapeHtml(data.company||'')}" placeholder="Company name"></label>
    <div style="display:flex;gap:8px">
      <input type="text" class="exp-start" value="${escapeHtml(data.start||'')}" placeholder="Start (e.g. Jan 2022)" />
      <input type="text" class="exp-end" value="${escapeHtml(data.end||'')}" placeholder="End (e.g. Present)" />
    </div>
    <label>Bullets <textarea class="exp-bullets" placeholder="- Achieved ...">${escapeHtml((data.bullets||[]).join('\n'))}</textarea></label>
  `;
  wrapper.querySelector('.remove').addEventListener('click', ()=>{
    wrapper.remove(); syncStateFromDOM(); renderPreview();
  });
  wrapper.querySelectorAll('input,textarea').forEach(i=>i.addEventListener('input', ()=>{ syncStateFromDOM(); renderPreview(); }));
  return wrapper;
}
function createEducationItem(data={}){
  const wrapper = document.createElement('div'); wrapper.className='list-item';
  wrapper.innerHTML = `
    <button class="remove" aria-label="Remove">✕</button>
    <label>Degree <input type="text" class="edu-degree" value="${escapeHtml(data.degree||'')}" placeholder="B.Sc. in ..."></label>
    <label>Institution <input type="text" class="edu-institution" value="${escapeHtml(data.institution||'')}" placeholder="University"></label>
    <div style="display:flex;gap:8px">
      <input type="text" class="edu-start" value="${escapeHtml(data.start||'')}" placeholder="Start (e.g. 2018)" />
      <input type="text" class="edu-end" value="${escapeHtml(data.end||'')}" placeholder="End (e.g. 2022)" />
    </div>
    <label>Notes <textarea class="edu-notes" placeholder="Optional notes">${escapeHtml(data.notes||'')}</textarea></label>
  `;
  wrapper.querySelector('.remove').addEventListener('click', ()=>{
    wrapper.remove(); syncStateFromDOM(); renderPreview();
  });
  wrapper.querySelectorAll('input,textarea').forEach(i=>i.addEventListener('input', ()=>{ syncStateFromDOM(); renderPreview(); }));
  return wrapper;
}

refs.addExpBtn.addEventListener('click', ()=>{ refs.experienceList.appendChild(createExperienceItem()); syncStateFromDOM(); renderPreview(); });
refs.addEduBtn.addEventListener('click', ()=>{ refs.educationList.appendChild(createEducationItem()); syncStateFromDOM(); renderPreview(); });

// sync dynamic fields to state
function syncStateFromDOM(){
  // experience
  const exNodes = Array.from(refs.experienceList.querySelectorAll('.list-item'));
  state.experience = exNodes.map(n => ({
    role: n.querySelector('.exp-role').value.trim(),
    company: n.querySelector('.exp-company').value.trim(),
    start: n.querySelector('.exp-start').value.trim(),
    end: n.querySelector('.exp-end').value.trim(),
    bullets: n.querySelector('.exp-bullets').value.split('\n').map(s=>s.trim()).filter(Boolean)
  }));
  // education
  const edNodes = Array.from(refs.educationList.querySelectorAll('.list-item'));
  state.education = edNodes.map(n => ({
    degree: n.querySelector('.edu-degree').value.trim(),
    institution: n.querySelector('.edu-institution').value.trim(),
    start: n.querySelector('.edu-start').value.trim(),
    end: n.querySelector('.edu-end').value.trim(),
    notes: n.querySelector('.edu-notes').value.trim()
  }));
  ['name','title','email','phone','location','summary'].forEach(k => state[k] = refs[k].value);
}

// preview rendering
function renderPreview(){
  refs.pv_name.textContent = state.name || 'Your name';
  refs.pv_title.textContent = state.title || 'Job title';
  refs.pv_contact.textContent = ([state.email, state.phone].filter(Boolean).join(' • ')) || 'email • phone';
  refs.pv_location.textContent = state.location || '';

  refs.pv_summary.textContent = state.summary || 'Short summary about your experience and focus.';

  // experience
  refs.pv_experience.innerHTML = '';
  if (!state.experience.length) {
    refs.pv_experience.innerHTML = '<div class="muted-inline">No experience added yet.</div>';
  } else {
    state.experience.forEach(exp=>{
      const container = document.createElement('div');
      const titleRow = document.createElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.justifyContent = 'space-between';
      titleRow.innerHTML = `<strong>${escapeHtml(exp.role)}</strong><span class="muted-inline">${escapeHtml((exp.start||'') + (exp.end? ' — ' + exp.end : ''))}</span>`;
      const comp = document.createElement('div'); comp.className='muted-inline'; comp.style.marginTop='6px'; comp.textContent = exp.company || '';
      container.appendChild(titleRow); container.appendChild(comp);
      if (exp.bullets && exp.bullets.length){
        exp.bullets.forEach(b=>{
          const p = document.createElement('div'); p.className='bullet'; p.textContent = b;
          container.appendChild(p);
        });
      }
      refs.pv_experience.appendChild(container);
    });
  }

  // education
  refs.pv_education.innerHTML = '';
  if (!state.education.length) {
    refs.pv_education.innerHTML = '<div class="muted-inline">No education added yet.</div>';
  } else {
    state.education.forEach(ed=>{
      const node = document.createElement('div');
      node.innerHTML = `<strong>${escapeHtml(ed.degree)}</strong><div class="muted-inline">${escapeHtml(ed.institution)}</div><div class="muted-inline" style="margin-top:6px">${escapeHtml((ed.start||'') + (ed.end? ' — ' + ed.end : ''))}</div><div style="margin-top:6px">${escapeHtml(ed.notes||'')}</div>`;
      refs.pv_education.appendChild(node);
    });
  }

  // skills
  refs.pv_skills.innerHTML = '';
  state.skills.forEach(s=>{
    const d = document.createElement('div'); d.className='chip'; d.textContent = s;
    refs.pv_skills.appendChild(d);
  });
}

// template selection via select + thumbnails
function updateTemplateClasses(){
  const tpl = document.getElementById('templateSelect').value; // classic/modern/clean
  const accent = document.getElementById('accentSelect').value; // accent-blue/accent-green
  // remove any tpl- or accent- classes
  const base = refs.previewContainer.className.split(/\s+/).filter(c => !c.startsWith('tpl-') && !c.startsWith('accent-'));
  refs.previewContainer.className = base.join(' ') + ' tpl-' + tpl + ' ' + accent;
  // also toggle active thumb buttons
  document.querySelectorAll('.tpl-thumb').forEach(b => b.classList.toggle('active', b.dataset.tpl === tpl));
}
document.getElementById('templateSelect').addEventListener('change', updateTemplateClasses);
document.getElementById('accentSelect').addEventListener('change', updateTemplateClasses);
document.querySelectorAll('.tpl-thumb').forEach(b => b.addEventListener('click', e=>{
  const t = e.currentTarget.dataset.tpl;
  document.getElementById('templateSelect').value = t;
  updateTemplateClasses();
}));

// save/load/clear
refs.saveBtn.addEventListener('click', ()=>{
  syncStateFromDOM();
  try { localStorage.setItem('codex_resume_draft', JSON.stringify(state)); refs.status.textContent = 'Draft saved.'; setTimeout(()=> refs.status.textContent='', 2000); } 
  catch(e){ refs.status.textContent = 'Save failed.'; }
});
refs.loadBtn.addEventListener('click', ()=>{
  const raw = localStorage.getItem('codex_resume_draft');
  if (!raw){ refs.status.textContent = 'No draft.'; setTimeout(()=> refs.status.textContent='', 1600); return; }
  try {
    const data = JSON.parse(raw);
    loadStateToForm(data);
    refs.status.textContent = 'Draft loaded.'; setTimeout(()=> refs.status.textContent='', 1600);
  } catch(e){ refs.status.textContent = 'Load failed.'; }
});
refs.clearBtn.addEventListener('click', ()=>{
  if (!confirm('Clear all fields?')) return;
  clearAll();
});

// load state to form
function loadStateToForm(data){
  Object.assign(state, {
    name: data.name||'', title: data.title||'', email: data.email||'', phone: data.phone||'',
    location: data.location||'', summary: data.summary||'', skills: data.skills||[], experience: data.experience||[], education: data.education||[]
  });
  refs.name.value = state.name; refs.title.value = state.title; refs.email.value = state.email;
  refs.phone.value = state.phone; refs.location.value = state.location; refs.summary.value = state.summary;
  renderSkills(); refs.experienceList.innerHTML = ''; refs.educationList.innerHTML = '';
  state.experience.forEach(e => refs.experienceList.appendChild(createExperienceItem(e)));
  state.education.forEach(ed => refs.educationList.appendChild(createEducationItem(ed)));
  renderPreview();
}
function clearAll(){
  state.name = state.title = state.email = state.phone = state.location = state.summary = '';
  state.skills = []; state.experience = []; state.education = [];
  refs.name.value = refs.title.value = refs.email.value = refs.phone.value = refs.location.value = refs.summary.value = '';
  refs.skillInput.value = ''; refs.skillsChips.innerHTML = ''; refs.experienceList.innerHTML = ''; refs.educationList.innerHTML = '';
  renderPreview();
}

// Download PDF (clones the resumePreview node so UI controls are not included)
refs.downloadBtn.addEventListener('click', async ()=>{
  syncStateFromDOM(); renderPreview();
  refs.downloadBtn.disabled = true; refs.downloadBtn.textContent = 'Generating...';

  // clone the element to print
  const node = document.getElementById('resumePreview').cloneNode(true);
  // apply template classes on clone to ensure style applied
  const previewParent = document.getElementById('previewContainer');
  const classes = previewParent.className; // contains tpl- and accent-
  node.className = node.className + ' ' + classes;

  // minor style tweaks for PDF readability
  node.style.padding = '28px';
  node.style.maxWidth = '800px';
  node.style.minHeight = '400px';
  // options for html2pdf
  const opt = {
    margin: 15,
    filename: `${(state.name||'resume').replace(/\s+/g,'_')}_Resume.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(node).save();
  } catch(e){
    alert('PDF generation failed. Try again.');
  } finally {
    refs.downloadBtn.disabled = false; refs.downloadBtn.textContent = 'Download PDF';
  }
});

// init: create one blank experience & education, set listeners
(function init(){
  refs.experienceList.appendChild(createExperienceItem());
  refs.educationList.appendChild(createEducationItem());
  updateTemplateClasses();
  renderPreview();
})();
