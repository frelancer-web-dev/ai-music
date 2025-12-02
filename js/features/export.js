// ============================================
// EXPORT.JS - Експорт альбому пісень (FIXED)
// ============================================

// ========== ОНОВЛЕННЯ СТАТИСТИКИ ==========

function updateExportStats() {
    const total = poems.length;
    const totalLinesCount = getTotalLines();
    const totalWordsCount = getTotalWords();
    
    const statusElement = document.getElementById('exportStatus');
    const totalLinesElement = document.getElementById('totalLines');
    const totalWordsElement = document.getElementById('totalWords');
    
    if (statusElement) statusElement.textContent = total;
    if (totalLinesElement) totalLinesElement.textContent = totalLinesCount.toLocaleString();
    if (totalWordsElement) totalWordsElement.textContent = totalWordsCount.toLocaleString();
    
    updatePreview();
}

function updatePreview() {
    const container = document.getElementById('previewContent');
    const noPreview = document.getElementById('noPreview');
    
    if (!container) return;
    
    if (poems.length === 0) {
        if (noPreview) noPreview.style.display = 'block';
        container.style.display = 'none';
        return;
    }
    
    if (noPreview) noPreview.style.display = 'none';
    container.style.display = 'block';
    
    container.innerHTML = poems
        .sort((a, b) => a.number - b.number)
        .map(poem => `
            <div class="preview-poem">
                <h4 class="preview-poem-title">🎤 ${poem.title}</h4>
                <div class="preview-poem-content">${poem.content}</div>
            </div>
        `).join('');
}

// ========== ЕКСПОРТ TXT ==========

function exportToTXT() {
    if (poems.length === 0) {
        showToast('⚠️ Немає пісень для експорту!', 'warning');
        return;
    }

    const title = document.getElementById('collectionTitle').value || 'Альбом пісень';
    const artist = document.getElementById('artistName').value || 'Виконавець';
    const sortedPoems = [...poems].sort((a, b) => a.number - b.number);
    
    let content = `${title}\n${'='.repeat(title.length)}\n\n`;
    content += `Виконавець: ${artist}\n`;
    
    const settings = getSettings();
    content += `Тема: ${settings.theme}\n`;
    content += `Настрій: ${settings.mood}\n`;
    content += `Жанр: ${settings.style}\n`;
    content += `Дата створення: ${new Date().toLocaleDateString('uk-UA')}\n`;
    content += `Всього пісень: ${poems.length}\n`;
    content += `Всього рядків: ${getTotalLines().toLocaleString()}\n`;
    content += `Всього слів: ${getTotalWords().toLocaleString()}\n`;
    content += `\n${'='.repeat(50)}\n\n`;
    
    sortedPoems.forEach(poem => {
        content += `\n\n🎤 ${poem.title}\n`;
        content += `${'-'.repeat(poem.title.length + 3)}\n\n`;
        content += `${poem.content}\n`;
    });
    
    Utils.download(content, `${title}.txt`, 'text/plain');
    showToast(`✅ Альбом "${title}" експортовано у форматі TXT!`, 'success');
}

// ========== ЕКСПОРТ DOCX (через HTML з можливістю відкриття у Word) ==========

function exportToDOCX() {
    if (poems.length === 0) {
        showToast('⚠️ Немає пісень для експорту!', 'warning');
        return;
    }

    const title = document.getElementById('collectionTitle').value || 'Альбом пісень';
    const artist = document.getElementById('artistName').value || 'Виконавець';
    const settings = getSettings();
    const sortedPoems = [...poems].sort((a, b) => a.number - b.number);
    
    // Створюємо HTML документ з правильними заголовками для Word
    let html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        @page { margin: 2cm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
        h1 { font-size: 24pt; text-align: center; margin-bottom: 10pt; }
        h2 { font-size: 16pt; margin-top: 20pt; margin-bottom: 10pt; }
        .meta { text-align: center; margin-bottom: 20pt; font-size: 11pt; color: #666; }
        .song { page-break-before: always; margin-bottom: 30pt; }
        .song:first-child { page-break-before: auto; }
        .song-title { font-size: 14pt; font-weight: bold; margin-bottom: 15pt; }
        .song-content { white-space: pre-wrap; line-height: 1.8; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="meta">
        <p>Виконавець: ${artist}</p>
        <p>Тема: ${settings.theme} | Настрій: ${settings.mood} | Жанр: ${settings.style}</p>
        <p>Дата: ${new Date().toLocaleDateString('uk-UA')}</p>
        <p>Пісень: ${poems.length} | Рядків: ${getTotalLines()} | Слів: ${getTotalWords()}</p>
    </div>
`;
    
    sortedPoems.forEach(poem => {
        html += `
    <div class="song">
        <div class="song-title">🎤 ${poem.title}</div>
        <div class="song-content">${poem.content}</div>
    </div>
`;
    });
    
    html += `
</body>
</html>`;
    
    // Створюємо blob з правильним MIME типом для Word
    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`✅ Альбом "${title}" експортовано у форматі DOCX!`, 'success');
}

// ========== ЕКСПОРТ PDF ==========

function exportToPDF() {
    if (poems.length === 0) {
        showToast('⚠️ Немає пісень для експорту!', 'warning');
        return;
    }

    const title = document.getElementById('collectionTitle').value || 'Альбом пісень';
    const sortedPoems = [...poems].sort((a, b) => a.number - b.number);
    
    // Перевіряємо наявність бібліотеки
    if (typeof window.jspdf === 'undefined') {
        showToast('⏳ Завантаження бібліотеки PDF...', 'info');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generatePDF(title, sortedPoems);
        script.onerror = () => {
            showToast('❌ Помилка завантаження бібліотеки PDF. Спробуйте HTML формат.', 'error');
        };
        document.head.appendChild(script);
    } else {
        generatePDF(title, sortedPoems);
    }
}

function generatePDF(title, poems) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        
        // Заголовок альбому
        doc.setFontSize(22);
        doc.text(title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        
        // Метаінформація
        doc.setFontSize(10);
        const settings = getSettings();
        const artist = document.getElementById('artistName').value || 'Виконавець';
        doc.text(`Виконавець: ${artist}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
        doc.text(`Тема: ${settings.theme} | Жанр: ${settings.style}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
        doc.text(`Настрій: ${settings.mood}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
        doc.text(`Дата: ${new Date().toLocaleDateString('uk-UA')}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
        doc.text(`Пісень: ${poems.length} | Рядків: ${getTotalLines().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        
        // Пісні
        poems.forEach((poem, index) => {
            if (index > 0) {
                doc.addPage();
                yPos = 20;
            }
            
            // Назва пісні
            doc.setFontSize(16);
            doc.text(`🎤 ${poem.title}`, margin, yPos);
            yPos += 12;
            
            // Текст пісні
            doc.setFontSize(10);
            const lines = poem.content.split('\n');
            
            lines.forEach(line => {
                if (yPos > pageHeight - margin) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const wrappedLines = doc.splitTextToSize(line || ' ', maxWidth);
                wrappedLines.forEach(wrappedLine => {
                    if (yPos > pageHeight - margin) {
                        doc.addPage();
                        yPos = 20;
                    }
                    doc.text(wrappedLine, margin, yPos);
                    yPos += 6;
                });
            });
        });
        
        doc.save(`${title}.pdf`);
        showToast(`✅ Альбом "${title}" експортовано у форматі PDF!`, 'success');
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        showToast('❌ Помилка експорту PDF: ' + error.message, 'error');
    }
}

// ========== КОПІЮВАННЯ ВСЬОГО ТЕКСТУ ==========

function copyAllText() {
    if (poems.length === 0) {
        showToast('⚠️ Немає тексту для копіювання!', 'warning');
        return;
    }
    
    const title = document.getElementById('collectionTitle').value || 'Альбом пісень';
    const artist = document.getElementById('artistName').value || 'Виконавець';
    const sortedPoems = [...poems].sort((a, b) => a.number - b.number);
    
    let text = `💿 ${title}\n`;
    text += `🎤 ${artist}\n`;
    text += `${'='.repeat(title.length + artist.length + 5)}\n\n`;
    
    sortedPoems.forEach(poem => {
        text += `\n🎤 ${poem.title}\n`;
        text += `${'-'.repeat(poem.title.length + 3)}\n\n`;
        text += `${poem.content}\n\n`;
    });
    
    copyToClipboard(text);
}
