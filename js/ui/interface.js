// ============================================
// INTERFACE.JS - UI компоненти та взаємодія
// ============================================

// Глобальні змінні UI
let currentTheme = localStorage.getItem('theme') || 'dark';

// ========== ТАБУЛЯЦІЯ ==========

function switchTab(tab) {
    const tabs = ['setup', 'templates', 'generate', 'export'];
    
    tabs.forEach(t => {
        const content = document.getElementById('content-' + t);
        const button = document.getElementById('tab-' + t);
        
        if (content) content.classList.remove('active');
        if (button) button.classList.remove('active', 'completed');
    });
    
    const activeContent = document.getElementById('content-' + tab);
    const activeButton = document.getElementById('tab-' + tab);
    
    if (activeContent) activeContent.classList.add('active');
    if (activeButton) activeButton.classList.add('active');
    
    // Позначаємо завершені кроки
    const tabOrder = ['setup', 'templates', 'generate', 'export'];
    const currentIndex = tabOrder.indexOf(tab);
    tabOrder.forEach((t, i) => {
        const btn = document.getElementById('tab-' + t);
        if (btn && i < currentIndex) {
            btn.classList.add('completed');
        }
    });
    
    // Оновлюємо дані для конкретної вкладки
    if (tab === 'templates') {
        displayTemplates();
    } else if (tab === 'generate') {
        displayGenerateContent();
    } else if (tab === 'export') {
        updateExportStats();
        updatePreview();
    }
}

// ========== HEADER ==========

function updateHeaderStats() {
    const completed = poems.length;
    const lines = getTotalLines();
    
    const poemsElement = document.getElementById('headerPoemsCount');
    const linesElement = document.getElementById('headerLinesCount');
    const collectionNameElement = document.getElementById('currentCollectionName');
    
    if (poemsElement) poemsElement.textContent = completed;
    if (linesElement) linesElement.textContent = lines;
    if (collectionNameElement) {
        const collectionName = document.getElementById('collectionTitle').value || 'Новий альбом';
        collectionNameElement.textContent = Utils.truncate(collectionName, 20);
    }
}

// ========== TOAST ПОВІДОМЛЕННЯ ==========

function showToast(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <span class="toast-icon">${CONFIG.TOAST_ICONS[type] || 'ℹ️'}</span>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    playNotificationSound(type);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function playNotificationSound(type) {
    if (localStorage.getItem('sound_enabled') !== 'true') return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = CONFIG.SOUND_FREQUENCIES[type] || 700;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.error('Audio error:', e);
    }
}

// ========== МОДАЛЬНІ ВІКНА ==========

function showModal(title, content, buttons = []) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;
    
    const buttonsHtml = buttons.map(btn => 
        `<button class="btn ${btn.class || 'btn-secondary'}" onclick="${btn.onclick}">${btn.text}</button>`
    ).join('');
    
    modalContainer.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">${buttonsHtml}</div>
            </div>
        </div>
    `;
}

function closeModal(event) {
    if (!event || event.target.classList.contains('modal-overlay')) {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) modalContainer.innerHTML = '';
    }
}

function confirmAction(message, onConfirm, onCancel = null) {
    showModal('Підтвердження', `<p style="line-height: 1.6;">${message}</p>`, [
        { text: 'Скасувати', class: 'btn-secondary', onclick: 'closeModal(); ' + (onCancel || '') },
        { text: 'Підтвердити', class: 'btn-primary', onclick: `closeModal(); ${onConfirm}` }
    ]);
}

// Асинхронна версія confirm
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            resolve(false);
            return;
        }
        
        const modalId = 'confirm-modal-' + Date.now();
        
        modalContainer.innerHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="document.getElementById('${modalId}').remove(); window.modalResolve_${modalId}(false)">×</button>
                    </div>
                    <div class="modal-body">
                        <p style="line-height: 1.6;">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove(); window.modalResolve_${modalId}(false)">Скасувати</button>
                        <button class="btn btn-primary" onclick="document.getElementById('${modalId}').remove(); window.modalResolve_${modalId}(true)">Підтвердити</button>
                    </div>
                </div>
            </div>
        `;
        
        window[`modalResolve_${modalId}`] = (result) => {
            delete window[`modalResolve_${modalId}`];
            resolve(result);
        };
    });
}

// ========== КОПІЮВАННЯ ==========

async function copyToClipboard(text) {
    const success = await Utils.copyToClipboard(text);
    showToast(success ? '✅ Текст скопійовано!' : '❌ Не вдалося скопіювати текст', 
              success ? 'success' : 'error');
}

// ========== ТЕМИ ==========

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    showToast(`🎨 Тема змінена на ${currentTheme === 'dark' ? 'темну' : 'світлу'}`, 'info');
}

// ========== МЕНЮ ІНСТРУМЕНТІВ ==========

function toggleToolsMenu() {
    const menu = document.getElementById('toolsMenu');
    if (!menu) return;
    
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    
    const soundText = document.getElementById('soundText');
    if (soundText) {
        soundText.textContent = localStorage.getItem('sound_enabled') === 'true' ? 'Вимкнути звуки' : 'Увімкнути звуки';
    }
}

function hideToolsMenu() {
    const menu = document.getElementById('toolsMenu');
    if (menu) menu.style.display = 'none';
}

function toggleSound() {
    const current = localStorage.getItem('sound_enabled') === 'true';
    localStorage.setItem('sound_enabled', !current);
    showToast(current ? '🔕 Звуки вимкнено' : '🔔 Звуки увімкнено', 'info');
}

function createBackup() {
    Storage.exportBackup();
}

function restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bak';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) await Storage.importBackup(file);
    };
    input.click();
}

// Ініціалізуємо тему
document.body.setAttribute('data-theme', currentTheme);