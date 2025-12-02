// ============================================
// TEMPLATES.JS - Управління шаблонами віршів
// ============================================

let selectedTemplate = null;

// ========== ВІДОБРАЖЕННЯ ШАБЛОНІВ ==========

function displayTemplates() {
    const container = document.getElementById('templatesContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <p style="color: var(--color-text-secondary); line-height: 1.7;">
                Оберіть шаблон для віршів або залиште "Вільний вірш" для генерації без строгих обмежень форми.
            </p>
        </div>
        
        <div class="templates-grid">
            ${CONFIG.POEM_TEMPLATES.map(template => `
                <div class="template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}" 
                     onclick="selectTemplate('${template.id}')">
                    <div class="template-name">${template.name}</div>
                    <div class="template-description">${template.description}</div>
                    ${template.example ? `
                        <div class="template-example">${template.example}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 2.5rem; text-align: center;">
            <button onclick="switchTab('generate')" class="btn btn-primary" style="min-width: 250px;">
                Продовжити до генерації →
            </button>
        </div>
    `;
}

// ========== ВИБІР ШАБЛОНУ ==========

function selectTemplate(templateId) {
    const previouslySelected = selectedTemplate?.id;
    
    if (templateId === previouslySelected) {
        // Знімаємо вибір
        selectedTemplate = null;
        showToast('ℹ️ Шаблон скинуто. Буде використано вільну форму.', 'info');
    } else {
        // Обираємо новий шаблон
        selectedTemplate = CONFIG.POEM_TEMPLATES.find(t => t.id === templateId);
        if (selectedTemplate) {
            showToast(`✅ Вибрано шаблон: ${selectedTemplate.name}`, 'success');
        }
    }
    
    // Оновлюємо відображення
    displayTemplates();
}

// ========== ОТРИМАННЯ ВИБРАНОГО ШАБЛОНУ ==========

function getSelectedTemplate() {
    return selectedTemplate;
}
