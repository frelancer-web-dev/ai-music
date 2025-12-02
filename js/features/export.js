// ============================================
// EXPORT.JS - Експорт альбому пісень
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
}

function updatePreview() {
    const container = document.getElementById('previewContent');
    if (!container) return;
    
    if (poems.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center;">Немає згенерованих пісень для перегляду</p>';
        return;
    }
    
    container.innerHTML = poems
        .sort((a, b) => a.number - b.number)
        .map(poem => `
            <div class="preview-poem">
                <h4 class="preview-poem-title">🎤 ${poem.title}</h4>
                <div class="preview-poem-content">${poem.content}</div>
            </div>
        `).join('');
}

// ========== ЕКСПОРТ АЛЬБОМУ ==========

function exportCollection(format) {
    if (poems.length === 0) {
        showToast('⚠️ Немає пісень для експорту!', 'warning');
        return;
    }

    const title = document.getElementById('collectionTitle').value || 'Альбом пісень';
    const sortedPoems = [...poems].sort((a, b) => a.number - b.number);

    if (format === 'txt') {
        exportTXT(title, sortedPoems);
    } else if (format === 'html') {
        exportHTML(title, sortedPoems);
    } else if (format === 'pdf') {
        exportPDF(title, sortedPoems);
    }
}

// ========== ЕКСПОРТ TXT ==========

function exportTXT(title, poems) {
    let content = `${title}\n${'='.repeat(title.length)}\n\n`;
    
    const theme = document.getElementById('theme').value;
    const mood = document.getElementById('mood').value;
    const style = document.getElementById('style').value;
    
    content += `Тема: ${theme}\n`;
    content += `Настрій: ${mood}\n`;
    content += `Жанр: ${style}\n`;
    content += `Дата створення: ${new Date().toLocaleDateString('uk-UA')}\n`;
    content += `Всього пісень: ${poems.length}\n`;
    content += `Всього рядків: ${getTotalLines().toLocaleString()}\n`;
    content += `Всього слів: ${getTotalWords().toLocaleString()}\n`;
    content += `\n${'='.repeat(50)}\n\n`;
    
    poems.forEach(poem => {
        content += `\n\n🎤 ${poem.title}\n`;
        content += `${'-'.repeat(poem.title.length + 3)}\n\n`;
        content += `${poem.content}\n`;
    });
    
    Utils.download(content, `${title}.txt`, 'text/plain');
    showToast(`✅ Альбом "${title}" експортовано у форматі TXT!`, 'success');
}

// ========== ЕКСПОРТ HTML ==========

function exportHTML(title, poems) {
    const theme = document.getElementById('theme').value;
    const mood = document.getElementById('mood').value;
    const style = document.getElementById('style').value;
    const totalLines = getTotalLines();
    const totalWords = getTotalWords();
    
    let html = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            max-width: 900px;
            margin: 40px auto;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.7;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .collection-header {
            text-align: center;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #1a1a1a;
            background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .collection-meta {
            color: #666;
            font-size: 0.9rem;
            margin-top: 20px;
        }
        .song {
            margin-bottom: 60px;
            page-break-before: always;
            background: white;
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #f59e0b;
            text-align: left;
        }
        .song-content {
            white-space: pre-wrap;
            line-height: 1.8;
            font-size: 1rem;
        }
        .song-meta {
            text-align: left;
            color: #999;
            font-size: 0.85rem;
            margin-top: 20px;
            font-style: italic;
        }
        @media print {
            body { background: white; margin: 0; }
            .song { page-break-after: always; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="collection-header">
        <h1>💿 ${title}</h1>
        <div class="collection-meta">
            <p>Тема: ${theme} | Настрій: ${mood} | Жанр: ${style}</p>
            <p>Дата: ${new Date().toLocaleDateString('uk-UA')}</p>
            <p>Пісень: ${poems.length} | Рядків: ${totalLines.toLocaleString()} | Слів: ${totalWords.toLocaleString()}</p>
        </div>
    </div>
`;
    
    poems.forEach(poem => {
        html += `
    <div class="song">
        <h2>🎤 ${poem.title}</h2>
        <div class="song-content">${poem.content}</div>
        <div class="song-meta">
            ${poem.linesCount} рядків | ${poem.wordsCount} слів
        </div>
    </div>
`;
    });
    
    html += `
</body>
</html>`;
    
    Utils.download(html, `${title}.html`, 'text/html');
    showToast(`✅ Альбом "${title}" експортовано у форматі HTML!`, 'success');
}

// ========== ЕКСПОРТ PDF ==========

function exportPDF(title, poems) {
    if (typeof window.jspdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generatePDF(title, poems);
        script.onerror = () => {
            showToast('❌ Помилка завантаження бібліотеки PDF. Спробуйте HTML формат.', 'error');
        };
        document.head.appendChild(script);
    } else {
        generatePDF(title, poems);
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
        const theme = document.getElementById('theme').value;
        const mood = document.getElementById('mood').value;
        const style = document.getElementById('style').value;
        doc.text(`Тема: ${theme} | Жанр: ${style}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
        doc.text(`Настрій: ${mood}`, pageWidth / 2, yPos, { align: 'center' });
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
                
                doc.text(line, margin, yPos);
                yPos += 6;
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
    const sortedPoems = [...poems].sort((a, b) => a.number - b.number);
    
    let text = `💿 ${title}\n${'='.repeat(title.length + 3)}\n\n`;
    
    sortedPoems.forEach(poem => {
        text += `\n🎤 ${poem.title}\n`;
        text += `${'-'.repeat(poem.title.length + 3)}\n\n`;
        text += `${poem.content}\n\n`;
    });
    
    copyToClipboard(text);
}