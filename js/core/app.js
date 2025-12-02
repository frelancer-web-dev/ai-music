// ============================================
// APP.JS - Головний файл ШІ-Музикант v1.0 (FIXED)
// ============================================

let currentCollectionId = null;
let poems = [];
let autoSaveTimer = null;

// ========== ІНІЦІАЛІЗАЦІЯ ==========

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Запуск ШІ-Музикант v1.0...');
    
    try {
        await initializeApp();
        setupEventListeners();
        await loadLastCollection();
        
        console.log('✅ Додаток готовий до роботи');
        
        if (!localStorage.getItem('aimusician_visited')) {
            setTimeout(showWelcomeMessage, 1000);
            localStorage.setItem('aimusician_visited', 'true');
        }
    } catch (error) {
        console.error('❌ Критична помилка ініціалізації:', error);
        showToast('❌ Помилка ініціалізації додатку: ' + error.message, 'error', 10000);
    }
});

async function initializeApp() {
    try {
        await Storage.init();
        setupSliders();
        
        const providerElement = document.getElementById('apiProvider');
        if (providerElement) {
            handleProviderChange({ target: providerElement });
        }
        
        updateHeaderStats();
        displayTemplates();
        displayGenerateContent();
        
    } catch (error) {
        console.error('Init error:', error);
        throw error;
    }
}

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
    setupSliders();
    
    const providerSelect = document.getElementById('apiProvider');
    if (providerSelect) {
        providerSelect.addEventListener('change', handleProviderChange);
    }
    
    // ВИПРАВЛЕНО: Правильні ID полів
    const autoSaveFields = [
        'collectionTitle', 'artistName', 'albumTheme', 'mood', 'genre', 
        'additionalDetails', 'apiProvider', 'modelName', 
        'temperature', 'poemsCount'
    ];
    
    autoSaveFields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener('change', () => scheduleAutoSave());
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.addEventListener('input', () => scheduleAutoSave());
            }
        }
    });
    
    window.addEventListener('beforeunload', async (e) => {
        if (currentCollectionId && poems.length > 0) {
            try {
                await Storage.saveCurrentCollection();
            } catch (error) {
                console.error('Помилка збереження при закритті:', error);
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('toolsMenu');
        const toolsBtn = e.target.closest('[onclick*="toggleToolsMenu"]');
        if (menu && !menu.contains(e.target) && !toolsBtn) {
            menu.style.display = 'none';
        }
    });
}

// ========== АВТОЗБЕРЕЖЕННЯ ==========

function scheduleAutoSave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    
    autoSaveTimer = setTimeout(async () => {
        if (currentCollectionId && poems.length > 0) {
            try {
                await Storage.saveCurrentCollection();
                console.log('💾 Автозбереження виконано');
            } catch (error) {
                console.error('Помилка автозбереження:', error);
            }
        }
    }, 3000);
}

// ========== НАЛАШТУВАННЯ ==========

function setupSliders() {
    const sliders = [
        { id: 'temperature', valueId: 'temperatureValue' },
        { id: 'poemsCount', valueId: 'poemsCountValue' }
    ];
    
    sliders.forEach(({ id, valueId }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            valueDisplay.textContent = slider.value;
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        }
    });
}

function handleProviderChange(e) {
    const provider = e.target.value;
    const modelSelect = document.getElementById('modelName');
    const customBlock = document.getElementById('customUrlBlock');
    
    if (!modelSelect) return;
    
    modelSelect.innerHTML = '';
    
    if (customBlock) {
        customBlock.style.display = 'none';
    }
    
    const models = CONFIG.MODELS[provider] || [];
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.text;
        modelSelect.appendChild(option);
    });
    
    if (provider === 'custom' && customBlock) {
        customBlock.style.display = 'block';
    }
}

async function saveSettings() {
    const collectionTitle = document.getElementById('collectionTitle').value.trim();
    const albumTheme = document.getElementById('albumTheme').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!collectionTitle || collectionTitle.length < 2) {
        showToast('❌ Назва альбому занадто коротка (мін. 2 символи)', 'error');
        document.getElementById('collectionTitle').focus();
        return;
    }
    
    if (!albumTheme || albumTheme.length < 2) {
        showToast('❌ Вкажіть тему альбому (мін. 2 символи)', 'error');
        document.getElementById('albumTheme').focus();
        return;
    }
    
    if (!apiKey || apiKey.length < 10) {
        showToast('⚠️ API ключ не вказано або занадто короткий', 'warning');
        document.getElementById('apiKey').focus();
        return;
    }
    
    try {
        await Storage.saveCurrentCollection();
        updateHeaderStats();
        showToast('💾 Налаштування збережено успішно!', 'success');
    } catch (error) {
        console.error('Помилка збереження:', error);
        showToast('❌ Помилка збереження: ' + error.message, 'error');
    }
}

// ВИПРАВЛЕНО: Додано всі поля
function getSettings() {
    return {
        apiProvider: document.getElementById('apiProvider')?.value || 'gemini',
        modelName: document.getElementById('modelName')?.value || 'gemini-2.5-flash',
        temperature: parseFloat(document.getElementById('temperature')?.value || '0.7'),
        collectionTitle: document.getElementById('collectionTitle')?.value.trim() || '',
        artistName: document.getElementById('artistName')?.value.trim() || '',
        theme: document.getElementById('albumTheme')?.value.trim() || '',
        mood: document.getElementById('mood')?.value || 'happy',
        style: document.getElementById('genre')?.value || 'pop',
        additionalDetails: document.getElementById('additionalDetails')?.value.trim() || '',
        poemsCount: parseInt(document.getElementById('poemsCount')?.value || '5')
    };
}

// ВИПРАВЛЕНО: Правильні ID полів
function applySettings(settings) {
    if (!settings) return;
    
    const fieldMapping = {
        'apiProvider': 'apiProvider',
        'modelName': 'modelName',
        'temperature': 'temperature',
        'collectionTitle': 'collectionTitle',
        'artistName': 'artistName',
        'theme': 'albumTheme',
        'mood': 'mood',
        'style': 'genre',
        'additionalDetails': 'additionalDetails',
        'poemsCount': 'poemsCount'
    };
    
    Object.entries(fieldMapping).forEach(([settingKey, elementId]) => {
        const element = document.getElementById(elementId);
        if (element && settings[settingKey] !== undefined) {
            element.value = settings[settingKey];
        }
    });
    
    updateSliderValues();
    
    const providerElement = document.getElementById('apiProvider');
    if (providerElement) {
        providerElement.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
            const modelElement = document.getElementById('modelName');
            if (modelElement && settings.modelName) {
                modelElement.value = settings.modelName;
            }
        }, 100);
    }
}

function updateSliderValues() {
    const sliders = [
        { id: 'temperature', valueId: 'temperatureValue' },
        { id: 'poemsCount', valueId: 'poemsCountValue' }
    ];
    
    sliders.forEach(({ id, valueId }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
    });
}

// ========== ВИДИМІСТЬ API КЛЮЧА ==========

function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    }
}

// ========== ЗАВАНТАЖЕННЯ ОСТАННЬОЇ ЗБІРКИ ==========

async function loadLastCollection() {
    const lastCollectionId = localStorage.getItem('last_collection_id');
    
    if (lastCollectionId) {
        try {
            const collection = await Storage.loadCollection(parseInt(lastCollectionId));
            
            if (collection) {
                console.log('📂 Завантажено останній альбом:', collection.name);
                
                displayTemplates();
                displayGenerateContent();
                updateExportStats();
                updateHeaderStats();
            }
        } catch (error) {
            console.error('Помилка завантаження останнього альбому:', error);
        }
    }
}

// ========== ПЕРІОДИЧНЕ ЗБЕРЕЖЕННЯ ==========

setInterval(async () => {
    if (currentCollectionId && poems.length > 0) {
        try {
            await Storage.saveCurrentCollection();
            localStorage.setItem('last_collection_id', currentCollectionId);
        } catch (error) {
            console.error('Помилка періодичного збереження:', error);
        }
    }
}, CONFIG.AUTOSAVE_INTERVAL);

// ========== ОБРОБКА ПОМИЛОК ==========

window.addEventListener('error', (event) => {
    console.error('❌ Глобальна помилка:', event.error);
    
    const criticalErrors = ['out of memory', 'quota exceeded', 'failed to fetch'];
    
    if (event.error && event.error.message) {
        const errorMsg = event.error.message.toLowerCase();
        
        if (criticalErrors.some(err => errorMsg.includes(err))) {
            showToast(
                '❌ Критична помилка:\n' + event.error.message + '\n\nПерезавантажте сторінку.', 
                'error', 
                15000
            );
        }
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Необроблене відхилення Promise:', event.reason);
    
    if (event.reason && typeof event.reason === 'object' && event.reason.message) {
        showToast('❌ Помилка: ' + event.reason.message, 'error', 8000);
    }
});

// ========== ВІТАЛЬНЕ ПОВІДОМЛЕННЯ ==========

function showWelcomeMessage() {
    const message = `
        <div style="line-height: 1.8;">
            <h3 style="margin-bottom: 1rem; color: var(--color-accent);">👋 Ласкаво просимо до ШІ-Музикант v1.0!</h3>
            
            <p style="margin-bottom: 1rem;">Створюй професійні тексти пісень з допомогою штучного інтелекту.</p>
            
            <p style="margin-bottom: 0.75rem;"><strong>🆕 Можливості:</strong></p>
            <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
                <li>🎤 Генерація текстів у різних жанрах</li>
                <li>📋 8 структур: від класики до репу</li>
                <li>🎵 Помічник рими для текстів</li>
                <li>📊 Аналіз ритму та співучості</li>
                <li>📖 Пошук синонімів</li>
                <li>📥 Експорт у TXT, HTML, PDF</li>
            </ul>
            
            <p style="color: var(--color-text-tertiary); font-size: 0.875rem; margin-top: 1rem;">
                💡 Натисніть 🛠️ в header, щоб переглянути всі інструменти
            </p>
        </div>
    `;
    
    showModal('🎉 Вітаємо!', message, [
        { 
            text: 'Почати роботу', 
            class: 'btn-primary', 
            onclick: 'closeModal(); switchTab("setup");' 
        }
    ]);
}

console.log('✅ ШІ-Музикант v1.0 ініціалізовано');
