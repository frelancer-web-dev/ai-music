// ============================================
// TOOLS.JS - Додаткові інструменти для поетів
// ============================================

// ========== ПОМІЧНИК РИМИ ==========

function showRhymeHelper() {
    const modalContent = `
        <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
                Введіть слово, щоб знайти рими до нього
            </p>
            
            <div class="form-group">
                <label class="form-label">Слово</label>
                <input type="text" id="rhymeWord" class="form-input" placeholder="Введіть слово...">
            </div>
            
            <div id="rhymeResults" style="display: none; margin-top: 1.5rem;">
                <label class="form-label">Рими:</label>
                <div id="rhymesList" style="
                    background: var(--color-bg-secondary);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    max-height: 300px;
                    overflow-y: auto;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                "></div>
            </div>
        </div>
    `;
    
    showModal(
        '🎵 Помічник рими',
        modalContent,
        [
            {
                text: 'Закрити',
                class: 'btn-secondary',
                onclick: 'closeModal()'
            },
            {
                text: '🔍 Знайти рими',
                class: 'btn-primary',
                onclick: 'findRhymes()'
            }
        ]
    );
}

async function findRhymes() {
    const wordInput = document.getElementById('rhymeWord');
    const word = wordInput?.value.trim();
    
    if (!word) {
        showToast('⚠️ Введіть слово', 'warning');
        return;
    }
    
    const resultsDiv = document.getElementById('rhymeResults');
    const rhymesList = document.getElementById('rhymesList');
    
    if (resultsDiv) resultsDiv.style.display = 'block';
    if (rhymesList) rhymesList.innerHTML = '⏳ Пошук рим...';
    
    try {
        const result = await callAPI(Prompts.findRhyme(word));
        const rhymes = result.split(',').map(r => r.trim()).filter(r => r);
        
        if (rhymesList) {
            rhymesList.innerHTML = rhymes.map(rhyme => `
                <span style="
                    background: rgba(245, 158, 11, 0.1);
                    color: var(--color-accent);
                    padding: 0.5rem 0.75rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    border: 1px solid var(--color-accent);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " 
                onclick="copyToClipboard('${rhyme.replace(/'/g, "\\'")}'); event.target.style.background='rgba(16, 185, 129, 0.2)';"
                title="Натисніть, щоб скопіювати">
                    ${rhyme}
                </span>
            `).join('');
        }
        
        showToast(`✅ Знайдено ${rhymes.length} рим!`, 'success');
        
    } catch (error) {
        console.error('Rhyme Helper Error:', error);
        if (rhymesList) {
            rhymesList.innerHTML = `<span style="color: var(--color-error);">❌ Помилка: ${error.message}</span>`;
        }
        showToast('❌ Помилка пошуку рим', 'error');
    }
}

// ========== АНАЛІЗ МЕТРИКИ ==========

function showMeterAnalyzer() {
    const modalContent = `
        <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
                Вставте текст вірша для аналізу метрики та ритму
            </p>
            
            <div class="form-group">
                <label class="form-label">Текст вірша</label>
                <textarea id="meterText" class="form-textarea" rows="8" placeholder="Вставте текст вірша..."></textarea>
            </div>
            
            <div id="meterResults" style="display: none; margin-top: 1.5rem;">
                <div id="meterAnalysis" style="
                    background: var(--color-bg-secondary);
                    padding: 1.5rem;
                    border-radius: var(--radius-md);
                    line-height: 1.8;
                "></div>
            </div>
        </div>
    `;
    
    showModal(
        '📊 Аналіз метрики',
        modalContent,
        [
            {
                text: 'Закрити',
                class: 'btn-secondary',
                onclick: 'closeModal()'
            },
            {
                text: '🔍 Аналізувати',
                class: 'btn-primary',
                onclick: 'analyzeMeter()'
            }
        ]
    );
}

async function analyzeMeter() {
    const textArea = document.getElementById('meterText');
    const text = textArea?.value.trim();
    
    if (!text) {
        showToast('⚠️ Введіть текст вірша', 'warning');
        return;
    }
    
    const resultsDiv = document.getElementById('meterResults');
    const analysisDiv = document.getElementById('meterAnalysis');
    
    if (resultsDiv) resultsDiv.style.display = 'block';
    if (analysisDiv) analysisDiv.innerHTML = '⏳ Аналіз метрики...';
    
    try {
        const result = await callAPI(Prompts.analyzeMeter(text));
        const analysis = Utils.parseJSON(result);
        
        // Базова статистика
        const stats = Utils.getPoemStats(text);
        
        if (analysisDiv) {
            analysisDiv.innerHTML = `
                <h4 style="color: var(--color-accent); margin-bottom: 1rem;">Результати аналізу</h4>
                
                <div style="margin-bottom: 1rem;">
                    <strong>Метрика:</strong> ${analysis.meter || 'Не визначено'}
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <strong>Ритм:</strong> ${analysis.rhythm || 'Не визначено'}
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <strong>Узгодженість:</strong> 
                    <span style="color: ${analysis.consistency >= 7 ? 'var(--color-success)' : analysis.consistency >= 4 ? 'var(--color-warning)' : 'var(--color-error)'}">
                        ${analysis.consistency || 'N/A'}/10
                    </span>
                </div>
                
                <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--color-border);">
                
                <h4 style="color: var(--color-accent); margin-bottom: 1rem;">Статистика</h4>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <strong>Рядків:</strong> ${stats.lines}
                    </div>
                    <div>
                        <strong>Слів:</strong> ${stats.words}
                    </div>
                    <div>
                        <strong>Складів/рядок:</strong> ${stats.avgSyllablesPerLine} (середнє)
                    </div>
                    <div>
                        <strong>Склади в рядках:</strong><br>
                        ${stats.syllablesPerLine.join(', ')}
                    </div>
                </div>
            `;
        }
        
        showToast('✅ Аналіз завершено!', 'success');
        
    } catch (error) {
        console.error('Meter Analyzer Error:', error);
        if (analysisDiv) {
            analysisDiv.innerHTML = `<span style="color: var(--color-error);">❌ Помилка: ${error.message}</span>`;
        }
        showToast('❌ Помилка аналізу метрики', 'error');
    }
}

// ========== ТЕЗАУРУС (СИНОНІМИ) ==========

function showThesaurus() {
    const modalContent = `
        <div style="margin-bottom: 1.5rem;">
            <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
                Знайдіть синоніми до слова
            </p>
            
            <div class="form-group">
                <label class="form-label">Слово</label>
                <input type="text" id="synonymWord" class="form-input" placeholder="Введіть слово...">
            </div>
            
            <div id="synonymResults" style="display: none; margin-top: 1.5rem;">
                <label class="form-label">Синоніми:</label>
                <div id="synonymsList" style="
                    background: var(--color-bg-secondary);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    max-height: 300px;
                    overflow-y: auto;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                "></div>
            </div>
        </div>
    `;
    
    showModal(
        '📖 Синоніми',
        modalContent,
        [
            {
                text: 'Закрити',
                class: 'btn-secondary',
                onclick: 'closeModal()'
            },
            {
                text: '🔍 Знайти синоніми',
                class: 'btn-primary',
                onclick: 'findSynonyms()'
            }
        ]
    );
}

async function findSynonyms() {
    const wordInput = document.getElementById('synonymWord');
    const word = wordInput?.value.trim();
    
    if (!word) {
        showToast('⚠️ Введіть слово', 'warning');
        return;
    }
    
    const resultsDiv = document.getElementById('synonymResults');
    const synonymsList = document.getElementById('synonymsList');
    
    if (resultsDiv) resultsDiv.style.display = 'block';
    if (synonymsList) synonymsList.innerHTML = '⏳ Пошук синонімів...';
    
    try {
        const result = await callAPI(Prompts.findSynonyms(word));
        const synonyms = result.split(',').map(s => s.trim()).filter(s => s);
        
        if (synonymsList) {
            synonymsList.innerHTML = synonyms.map(synonym => `
                <span style="
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--color-success);
                    padding: 0.5rem 0.75rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    border: 1px solid var(--color-success);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " 
                onclick="copyToClipboard('${synonym.replace(/'/g, "\\'")}'); event.target.style.background='rgba(16, 185, 129, 0.3)';"
                title="Натисніть, щоб скопіювати">
                    ${synonym}
                </span>
            `).join('');
        }
        
        showToast(`✅ Знайдено ${synonyms.length} синонімів!`, 'success');
        
    } catch (error) {
        console.error('Thesaurus Error:', error);
        if (synonymsList) {
            synonymsList.innerHTML = `<span style="color: var(--color-error);">❌ Помилка: ${error.message}</span>`;
        }
        showToast('❌ Помилка пошуку синонімів', 'error');
    }
}
