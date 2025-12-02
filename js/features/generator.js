// ============================================
// GENERATOR.JS - Генерація текстів пісень (FIXED)
// ============================================

let isGeneratingAll = false;
let shouldStop = false;

// ========== ГЕНЕРАЦІЯ ОДНІЄЇ ПІСНІ ==========

async function generatePoem(poemNumber) {
    const btn = document.getElementById(`btn-poem-${poemNumber}`);
    
    if (btn) {
        btn.disabled = true;
        btn.classList.add('loading');
        btn.textContent = 'Генерація...';
    }

    try {
        const settings = getSettings();
        
        // Генеруємо назву
        const titlePrompt = Prompts.poemTitle({
            theme: settings.theme,
            mood: settings.mood,
            style: settings.style
        });
        
        const title = await callAPI(titlePrompt);
        
        // Генеруємо текст пісні
        const poemPrompt = Prompts.poem({
            theme: settings.theme,
            mood: settings.mood,
            style: settings.style,
            additionalDetails: settings.additionalDetails,
            template: getSelectedTemplate(),
            poemNumber: poemNumber
        });

        const content = await callAPI(poemPrompt);
        
        if (!content || content.trim().length < 20) {
            throw new Error('Текст занадто короткий');
        }
        
        const cleanContent = content
            .replace(/^```.*\n?/gm, '')
            .replace(/```$/g, '')
            .trim();
        
        const existingIndex = poems.findIndex(p => p.number === poemNumber);
        const newPoem = {
            number: poemNumber,
            title: title.replace(/["""]/g, '').trim(),
            content: cleanContent,
            linesCount: Utils.countLines(cleanContent),
            wordsCount: Utils.countWords(cleanContent),
            generatedAt: new Date().toISOString(),
            template: getSelectedTemplate()?.id || 'free_form'
        };
        
        if (existingIndex >= 0) {
            poems[existingIndex] = newPoem;
        } else {
            poems.push(newPoem);
        }
        
        poems.sort((a, b) => a.number - b.number);
        
        await Storage.saveCurrentCollection();
        
        if (btn) {
            btn.classList.remove('loading');
            btn.textContent = '✅ Готово';
            btn.classList.add('btn-success');
        }
        
        updateHeaderStats();
        displayGenerateContent();
        
        showToast(`✅ Пісню ${poemNumber} згенеровано!\n🎤 "${newPoem.title}"`, 'success', 7000);
        
        return true;
        
    } catch (error) {
        console.error('Generation error:', error);
        showToast('❌ Помилка: ' + error.message, 'error');
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
            btn.textContent = 'Згенерувати';
        }
        return false;
    }
}

// ========== ГЕНЕРАЦІЯ ВСІХ ПІСЕНЬ ==========

// ВИПРАВЛЕНО: Додано функцію generateLyrics
async function generateLyrics() {
    await generateAllPoems();
}

async function generateAllPoems() {
    if (isGeneratingAll) {
        shouldStop = true;
        showToast('⏹️ Зупинка...', 'info');
        return;
    }
    
    const settings = getSettings();
    if (!settings.theme || !settings.collectionTitle) {
        showToast('❌ Заповніть назву альбому та тему!', 'error');
        switchTab('setup');
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    if (!btn) return;
    
    isGeneratingAll = true;
    shouldStop = false;
    
    btn.textContent = '⏹️ Зупинити';
    btn.classList.add('btn-danger');
    btn.classList.remove('btn-primary');
    
    const total = settings.poemsCount;
    let successCount = 0;
    
    // Показуємо прогрес
    const progressDiv = document.getElementById('generationProgress');
    if (progressDiv) {
        progressDiv.style.display = 'block';
    }
    
    for (let i = 1; i <= total; i++) {
        if (shouldStop) {
            showToast(`⏹️ Зупинено. Згенеровано: ${successCount}/${total}`, 'warning');
            break;
        }
        
        if (poems.find(p => p.number === i)) {
            continue;
        }
        
        // Оновлюємо прогрес
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = `Генерація ${i} з ${total}...`;
        }
        
        const success = await generatePoem(i);
        
        if (success) {
            successCount++;
        } else {
            const shouldContinue = await showConfirmModal(
                'Помилка генерації',
                `Не вдалося згенерувати пісню ${i}.<br><br>Продовжити?`
            );
            
            if (!shouldContinue) {
                shouldStop = true;
                break;
            }
        }
        
        if (i < total && !shouldStop) {
            await Utils.sleep(1000);
        }
    }
    
    // Ховаємо прогрес
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
    
    resetGenerateAllButton();
    
    if (successCount > 0) {
        showToast(`✅ Завершено!\n\nЗгенеровано: ${successCount}/${total}`, 'success', 10000);
        // Автоматично переключаємо на вкладку експорту
        switchTab('export');
    }
}

function resetGenerateAllButton() {
    isGeneratingAll = false;
    shouldStop = false;
    
    const btn = document.getElementById('generateBtn');
    if (btn) {
        btn.textContent = '🎵 Згенерувати тексти пісень';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-primary');
    }
}

// ========== ВІДОБРАЖЕННЯ ==========

function displayGenerateContent() {
    const container = document.getElementById('generatedContent');
    const noContent = document.getElementById('noContent');
    
    if (!container) return;
    
    const settings = getSettings();
    const total = settings.poemsCount;
    const completed = poems.length;
    
    if (completed === 0) {
        if (noContent) noContent.style.display = 'block';
        container.style.display = 'none';
        return;
    }
    
    if (noContent) noContent.style.display = 'none';
    container.style.display = 'block';
    
    let html = `
        <div class="progress-container" style="margin-bottom: 2rem;">
            <h3>📊 Прогрес генерації</h3>
            <p>Згенеровано: <strong style="color: var(--color-accent);">${completed}/${total}</strong> пісень</p>
        </div>
        
        <div class="poems-list">
    `;
    
    for (let i = 1; i <= total; i++) {
        const poem = poems.find(p => p.number === i);
        
        html += `
            <div class="poem-item">
                <div class="poem-header">
                    <h3 class="poem-title">${poem ? `${i}. ${poem.title}` : `Пісня ${i}`}</h3>
                    <div class="poem-actions">
                        ${!poem 
                            ? `<button onclick="generatePoem(${i})" id="btn-poem-${i}" class="btn btn-primary btn-sm">⚡ Згенерувати</button>`
                            : `
                                <button onclick="viewPoem(${i})" class="btn btn-secondary btn-sm">👁️</button>
                                <button onclick="improvePoem(${i})" class="btn btn-secondary btn-sm">✨</button>
                                <button onclick="regeneratePoem(${i})" class="btn btn-secondary btn-sm">🔄</button>
                                <button onclick="deletePoem(${i})" class="btn btn-danger btn-sm">🗑️</button>
                            `
                        }
                    </div>
                </div>
                ${poem 
                    ? `
                        <div class="poem-meta">
                            <span>📏 ${poem.linesCount} рядків</span>
                            <span>📝 ${poem.wordsCount} слів</span>
                            <span>🎵 ${CONFIG.POEM_TEMPLATES.find(t => t.id === poem.template)?.name || 'Вільна форма'}</span>
                            <span>🕐 ${Utils.formatDate(poem.generatedAt)}</span>
                        </div>
                        <div class="poem-content">${Utils.truncate(poem.content, CONFIG.PREVIEW_LENGTH)}</div>
                    ` 
                    : `<p style="color: var(--color-text-tertiary); font-size: 0.875rem; margin-top: 0.75rem;">Натисніть "Згенерувати" для створення тексту</p>`
                }
            </div>
        `;
    }
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ========== УПРАВЛІННЯ ==========

function viewPoem(poemNumber) {
    const poem = poems.find(p => p.number === poemNumber);
    if (!poem) return;
    
    const stats = Utils.getPoemStats(poem.content);
    
    const modalContent = `
        <div style="max-height: 500px; overflow-y: auto; line-height: 1.8; white-space: pre-wrap; font-family: 'Segoe UI', system-ui, sans-serif; font-size: 1rem;">
            ${poem.content}
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); color: var(--color-text-tertiary); font-size: 0.875rem;">
            <strong>Статистика:</strong><br>
            📏 ${stats.lines} рядків | 📝 ${stats.words} слів | 
            📊 ${stats.avgSyllablesPerLine} складів/рядок (середнє)
        </div>
    `;
    
    showModal(
        `🎤 ${poem.title}`,
        modalContent,
        [
            {
                text: '📋 Копіювати',
                class: 'btn-secondary',
                onclick: `copyToClipboard(\`${poem.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`); closeModal();`
            },
            {
                text: 'Закрити',
                class: 'btn-primary',
                onclick: 'closeModal()'
            }
        ]
    );
}

async function improvePoem(poemNumber) {
    const poem = poems.find(p => p.number === poemNumber);
    if (!poem) return;
    
    const confirmed = await showConfirmModal(
        'Покращити текст?',
        'AI спробує покращити текст пісні, зберігаючи структуру. Попередня версія буде замінена.'
    );
    
    if (!confirmed) return;
    
    try {
        showToast('⏳ Покращення тексту...', 'info');
        
        const improvedContent = await callAPI(Prompts.improvePoem(poem.content));
        
        const index = poems.findIndex(p => p.number === poemNumber);
        if (index >= 0) {
            poems[index].content = improvedContent.trim();
            poems[index].linesCount = Utils.countLines(improvedContent);
            poems[index].wordsCount = Utils.countWords(improvedContent);
        }
        
        await Storage.saveCurrentCollection();
        displayGenerateContent();
        
        showToast('✅ Текст покращено!', 'success');
    } catch (error) {
        showToast('❌ Помилка покращення: ' + error.message, 'error');
    }
}

function regeneratePoem(poemNumber) {
    confirmAction(
        `Перегенерувати пісню ${poemNumber}? Поточний текст буде втрачено.`,
        `confirmRegeneratePoem(${poemNumber})`
    );
}

async function confirmRegeneratePoem(poemNumber) {
    await generatePoem(poemNumber);
}

function deletePoem(poemNumber) {
    confirmAction(
        `Видалити пісню ${poemNumber}?`,
        `confirmDeletePoem(${poemNumber})`
    );
}

async function confirmDeletePoem(poemNumber) {
    const index = poems.findIndex(p => p.number === poemNumber);
    if (index >= 0) {
        poems.splice(index, 1);
    }
    
    await Storage.saveCurrentCollection();
    displayGenerateContent();
    updateHeaderStats();
    
    showToast('✅ Пісню видалено', 'success');
}
