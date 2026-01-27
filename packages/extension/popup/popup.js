document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const copyBtn = document.getElementById('copyBtn');
  const countEl = document.getElementById('count');
  const listEl = document.getElementById('annotationsList');
  const emptyState = document.getElementById('emptyState');
  
  let isActive = false;
  let annotations = [];
  
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  
  async function loadState() {
    const result = await chrome.storage.local.get(['isActive']);
    isActive = result.isActive ?? false;
    updateToggleButton();
  }
  
  async function loadAnnotations() {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_ANNOTATIONS_FROM_CONTENT' });
      annotations = response?.annotations || [];
    } catch {
      annotations = [];
    }
    
    renderAnnotations();
  }
  
  function updateToggleButton() {
    toggleBtn.classList.toggle('active', isActive);
    toggleBtn.querySelector('span').textContent = isActive ? 'Active' : 'Activate';
  }
  
  function renderAnnotations() {
    countEl.textContent = annotations.length;
    
    if (annotations.length === 0) {
      emptyState.style.display = 'block';
      const items = listEl.querySelectorAll('.annotation-item');
      items.forEach(item => item.remove());
      return;
    }
    
    emptyState.style.display = 'none';
    
    const items = listEl.querySelectorAll('.annotation-item');
    items.forEach(item => item.remove());
    
    annotations.forEach((annotation, index) => {
      const item = document.createElement('div');
      item.className = 'annotation-item';
      item.dataset.annotationId = annotation.id;
      item.innerHTML = `
        <div class="annotation-description">
          <span class="annotation-number">${index + 1}</span>
          ${escapeHtml(annotation.description)}
        </div>
        <div class="annotation-selector">${escapeHtml(annotation.selector)}</div>
        <div class="annotation-feedback">${escapeHtml(annotation.feedback)}</div>
        <div class="annotation-actions">
          <button class="annotation-action-btn edit" data-action="edit">Edit</button>
          <button class="annotation-action-btn delete" data-action="delete">Delete</button>
        </div>
      `;
      
      const editBtn = item.querySelector('[data-action="edit"]');
      const deleteBtn = item.querySelector('[data-action="delete"]');
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        enterEditMode(item, annotation);
      });
      
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteAnnotation(annotation.id);
      });
      
      listEl.appendChild(item);
    });
  }
  
  function enterEditMode(item, annotation) {
    const feedbackEl = item.querySelector('.annotation-feedback');
    const actionsEl = item.querySelector('.annotation-actions');
    
    feedbackEl.style.display = 'none';
    actionsEl.style.display = 'none';
    
    const editForm = document.createElement('div');
    editForm.className = 'annotation-edit-form';
    editForm.innerHTML = `
      <textarea class="annotation-edit-textarea">${escapeHtml(annotation.feedback)}</textarea>
      <div class="annotation-edit-actions">
        <button class="annotation-edit-btn cancel">Cancel</button>
        <button class="annotation-edit-btn save">Save</button>
      </div>
    `;
    
    item.appendChild(editForm);
    
    const textarea = editForm.querySelector('textarea');
    const saveBtn = editForm.querySelector('.save');
    const cancelBtn = editForm.querySelector('.cancel');
    
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
    const exitEditMode = () => {
      editForm.remove();
      feedbackEl.style.display = 'block';
      actionsEl.style.display = 'flex';
    };
    
    cancelBtn.addEventListener('click', exitEditMode);
    
    saveBtn.addEventListener('click', async () => {
      const newFeedback = textarea.value.trim();
      if (!newFeedback) {
        textarea.focus();
        return;
      }
      
      await updateAnnotation(annotation.id, newFeedback);
      annotation.feedback = newFeedback;
      feedbackEl.textContent = newFeedback;
      exitEditMode();
    });
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        saveBtn.click();
      }
      if (e.key === 'Escape') {
        exitEditMode();
      }
    });
  }
  
  async function updateAnnotation(id, newFeedback) {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        type: 'UPDATE_ANNOTATION', 
        id, 
        feedback: newFeedback 
      });
    } catch {}
  }
  
  async function deleteAnnotation(id) {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        type: 'DELETE_ANNOTATION', 
        id 
      });
      
      annotations = annotations.filter(a => a.id !== id);
      renderAnnotations();
    } catch {}
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function generateMarkdown() {
    if (annotations.length === 0) return '';
    
    let md = `# UI Annotations\n\n`;
    md += `**Page:** ${window.location.href || 'Unknown'}\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;
    
    annotations.forEach((annotation, index) => {
      md += `## ${index + 1}. ${annotation.description}\n\n`;
      md += `**Selector:** \`${annotation.selector}\`\n\n`;
      md += `**Feedback:**\n${annotation.feedback}\n\n`;
      md += `---\n\n`;
    });
    
    return md;
  }
  
  toggleBtn.addEventListener('click', async () => {
    isActive = !isActive;
    await chrome.storage.local.set({ isActive });
    
    const tab = await getCurrentTab();
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'STATE_CHANGED', isActive }).catch(() => {});
    }
    
    updateToggleButton();
  });
  
  copyBtn.addEventListener('click', async () => {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_ANNOTATIONS_FROM_CONTENT' });
      annotations = response?.annotations || [];
    } catch {
      annotations = [];
    }
    
    if (annotations.length === 0) {
      copyBtn.querySelector('span').textContent = 'No data';
      setTimeout(() => {
        copyBtn.querySelector('span').textContent = 'Copy';
      }, 1500);
      return;
    }
    
    let md = `# UI Annotations\n\n`;
    md += `**Page:** ${tab.url}\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;
    
    annotations.forEach((annotation, index) => {
      md += `## ${index + 1}. ${annotation.description}\n\n`;
      md += `**Selector:** \`${annotation.selector}\`\n\n`;
      md += `**Feedback:**\n${annotation.feedback}\n\n`;
      md += `---\n\n`;
    });
    
    try {
      await navigator.clipboard.writeText(md);
      copyBtn.querySelector('span').textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.querySelector('span').textContent = 'Copy';
      }, 1500);
    } catch {
      copyBtn.querySelector('span').textContent = 'Failed';
      setTimeout(() => {
        copyBtn.querySelector('span').textContent = 'Copy';
      }, 1500);
    }
  });
  
  await loadState();
  await loadAnnotations();
});
