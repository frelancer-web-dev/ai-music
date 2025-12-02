// ============================================
// COLLECTIONS.JS - Управління збірками віршів
// ============================================

// ========== ПОКАЗАТИ СПИСОК ЗБІРОК ==========

async function showCollectionsModal() {
    const collections = await Storage.getAllCollections();
    
    let collectionsHTML = '';
    
    if (collections.length === 0) {
        collectionsHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">Немає збережених збірок</p>';
    } else {
        collectionsHTML = '<div class="project-list">';
        
        collections.forEach(collection => {
            const isActive = currentCollectionId === collection.id;
            const lastModified = Utils.formatDate(collection.lastModified);
            
            collectionsHTML += `
                <div class="project-item ${isActive ? 'active' : ''}" style="${isActive ? 'border-color: var(--color-accent);' : ''}">
                    <div class="project-info" onclick="loadCollectionById(${collection.id})">
                        <div class="project-name">
                            ${collection.name}
                            ${isActive ? '<span style="color: var(--color-accent); margin-left: 0.5rem;">● Активна</span>' : ''}
                        </div>
                        <div class="project-meta">
                            📝 ${collection.poemsCount} віршів | 
                            📏 ${collection.totalLines} рядків |
                            🕐 ${lastModified}
                        </div>
                    </div>
                    <div class="project-actions">
                        ${!isActive ? `
                            <button onclick="event.stopPropagation(); loadCollectionById(${collection.id})" class="btn btn-secondary btn-sm" title="Завантажити">
                                📂
                            </button>
                        ` : ''}
                        <button onclick="event.stopPropagation(); duplicateCollection(${collection.id})" class="btn btn-secondary btn-sm" title="Дублювати">
                            📋
                        </button>
                        <button onclick="event.stopPropagation(); exportCollectionData(${collection.id})" class="btn btn-secondary btn-sm" title="Експорт">
                            📤
                        </button>
                        <button onclick="event.stopPropagation(); deleteCollectionConfirm(${collection.id})" class="btn btn-danger btn-sm" title="Видалити">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        });
        
        collectionsHTML += '</div>';
    }
    
    const modalContent = `
        ${collectionsHTML}
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
            <button onclick="createNewCollection()" class="btn btn-primary" style="width: 100%;">
                ➕ Створити нову збірку
            </button>
        </div>
        <div style="margin-top: 0.75rem;">
            <button onclick="importCollectionFile()" class="btn btn-secondary" style="width: 100%;">
                📥 Імпортувати збірку
            </button>
        </div>
    `;
    
    showModal('📂 Мої збірки', modalContent, [
        { text: 'Закрити', class: 'btn-primary', onclick: 'closeModal()' }
    ]);
}

// ========== ЗАВАНТАЖЕННЯ ЗБІРКИ ==========

async function loadCollectionById(collectionId) {
    const collection = await Storage.loadCollection(collectionId);
    
    if (collection) {
        displayTemplates();
        displayGenerateContent();
        updateHeaderStats();
        updateExportStats();
        closeModal();
        showToast(`✅ Збірку "${collection.name}" завантажено!`, 'success');
    } else {
        showToast('❌ Помилка завантаження збірки', 'error');
    }
}

// ========== СТВОРЕННЯ НОВОЇ ЗБІРКИ ==========

function createNewCollection() {
    confirmAction(
        'Створити нову збірку? Поточна збірка буде збережена автоматично.',
        'confirmCreateNewCollection()'
    );
}

async function confirmCreateNewCollection() {
    // Зберігаємо поточну збірку
    if (currentCollectionId) {
        await Storage.saveCurrentCollection();
    }
    
    // Скидаємо дані
    currentCollectionId = null;
    poems = [];
    selectedTemplate = null;
    
    // Очищуємо форму
    document.getElementById('collectionTitle').value = '';
    document.getElementById('theme').value = '';
    document.getElementById('additionalDetails').value = '';
    
    // Оновлюємо інтерфейс
    updateHeaderStats();
    displayTemplates();
    displayGenerateContent();
    
    // Перемикаємо на вкладку налаштувань
    switchTab('setup');
    
    closeModal();
    showToast('✨ Нову збірку створено!', 'success');
}

// ========== ДУБЛЮВАННЯ ЗБІРКИ ==========

async function duplicateCollection(collectionId) {
    const collection = await Storage.load('collections', collectionId);
    
    if (!collection) {
        showToast('❌ Збірку не знайдено', 'error');
        return;
    }
    
    const newCollection = {
        ...collection,
        id: Date.now(),
        name: collection.name + ' (копія)',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    await Storage.save('collections', newCollection);
    
    // Копіюємо вірші
    const allPoems = await Storage.getAll('poems');
    const collectionPoems = allPoems.filter(p => p.collectionId === collectionId);
    
    for (const poem of collectionPoems) {
        await Storage.save('poems', {
            ...poem,
            id: `${newCollection.id}_${poem.number}`,
            collectionId: newCollection.id
        });
    }
    
    showToast(`✅ Збірку "${newCollection.name}" створено!`, 'success');
    showCollectionsModal();
}

// ========== ЕКСПОРТ ЗБІРКИ ЯК JSON ==========

async function exportCollectionData(collectionId) {
    const collection = await Storage.load('collections', collectionId);
    
    if (!collection) {
        showToast('❌ Збірку не знайдено', 'error');
        return;
    }
    
    // Завантажуємо вірші збірки
    const allPoems = await Storage.getAll('poems');
    const collectionPoems = allPoems.filter(p => p.collectionId === collectionId);
    
    const exportData = {
        ...collection,
        poems: collectionPoems
    };
    
    const json = JSON.stringify(exportData, null, 2);
    Utils.download(json, `${collection.name}_collection.json`, 'application/json');
    showToast(`✅ Збірку "${collection.name}" експортовано!`, 'success');
}

// ========== ІМПОРТ ЗБІРКИ ==========

function importCollectionFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const collection = JSON.parse(text);
            
            // Валідація структури збірки
            if (!collection.name || !collection.settings) {
                throw new Error('Невірний формат збірки');
            }
            
            // Створюємо новий ID для імпортованої збірки
            const newId = Date.now();
            collection.id = newId;
            collection.lastModified = new Date().toISOString();
            collection.name = collection.name + ' (імпорт)';
            
            // Зберігаємо збірку
            await Storage.save('collections', collection);
            
            // Зберігаємо вірші, якщо вони є
            if (collection.poems && Array.isArray(collection.poems)) {
                for (const poem of collection.poems) {
                    await Storage.save('poems', {
                        ...poem,
                        id: `${newId}_${poem.number}`,
                        collectionId: newId
                    });
                }
            }
            
            closeModal();
            showToast(`✅ Збірку "${collection.name}" імпортовано!`, 'success');
            
            // Пропонуємо завантажити імпортовану збірку
            setTimeout(async () => {
                const shouldLoad = await showConfirmModal(
                    'Завантажити збірку?',
                    `Відкрити щойно імпортовану збірку "${collection.name}"?`
                );
                
                if (shouldLoad) {
                    await loadCollectionById(newId);
                }
            }, 500);
            
        } catch (error) {
            showToast('❌ Помилка імпорту: ' + error.message, 'error');
        }
    };
    input.click();
}

// ========== ВИДАЛЕННЯ ЗБІРКИ ==========

async function deleteCollectionConfirm(collectionId) {
    const collection = await Storage.load('collections', collectionId);
    
    if (!collection) {
        showToast('❌ Збірку не знайдено', 'error');
        return;
    }
    
    confirmAction(
        `Ви впевнені, що хочете видалити збірку "${collection.name}"?<br><br>
        <strong>Увага:</strong> Ця дія незворотна!`,
        `confirmDeleteCollection(${collectionId})`
    );
}

async function confirmDeleteCollection(collectionId) {
    const collection = await Storage.load('collections', collectionId);
    const collectionName = collection?.name || 'Збірка';
    
    await Storage.deleteCollection(collectionId);
    
    showToast(`✅ Збірку "${collectionName}" видалено`, 'success');
    showCollectionsModal();
    
    // Якщо видалили активну збірку, скидаємо дані
    if (currentCollectionId === collectionId) {
        currentCollectionId = null;
        poems = [];
        selectedTemplate = null;
        updateHeaderStats();
        displayTemplates();
        displayGenerateContent();
    }
}
