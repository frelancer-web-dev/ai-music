// ============================================
// UTILS.JS - Допоміжні функції для ШІ-Поет v1.0
// ============================================

const Utils = {
    // ========== РОБОТА З ТЕКСТОМ ==========
    
    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    },
    
    countLines(text) {
        if (!text) return 0;
        return text.trim().split('\n').filter(l => l.trim().length > 0).length;
    },
    
    countSyllables(word) {
        // Спрощений підрахунок складів для української мови
        word = word.toLowerCase();
        const vowels = 'аеєиіїоуюя';
        let count = 0;
        let prevIsVowel = false;
        
        for (let char of word) {
            const isVowel = vowels.includes(char);
            if (isVowel && !prevIsVowel) {
                count++;
            }
            prevIsVowel = isVowel;
        }
        
        return count || 1;
    },
    
    truncate(text, length) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    // ========== РИМА ==========
    
    findRhymes(word) {
        // Базова функція для пошуку рими (останні 2-3 символи)
        word = word.toLowerCase().trim();
        const ending = word.slice(-3);
        return ending;
    },
    
    checkRhyme(word1, word2) {
        word1 = word1.toLowerCase().trim();
        word2 = word2.toLowerCase().trim();
        
        // Перевіряємо останні 2-3 літери
        const ending1 = word1.slice(-3);
        const ending2 = word2.slice(-3);
        
        return ending1 === ending2 || 
               word1.slice(-2) === word2.slice(-2);
    },
    
    // ========== JSON ==========
    
    cleanJSON(text) {
        return text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .replace(/^[^{[]*/, '')
            .replace(/[^}\]]*$/, '')
            .trim();
    },
    
    parseJSON(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Порожня відповідь від API');
        }
        
        // Спроба 1: Прямий парсинг
        try {
            return JSON.parse(text);
        } catch (e) {}
        
        // Спроба 2: Видалення markdown
        try {
            const cleaned = this.cleanJSON(text);
            return JSON.parse(cleaned);
        } catch (e) {}
        
        // Спроба 3: Пошук JSON між дужками
        try {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                let extracted = text.substring(firstBrace, lastBrace + 1);
                extracted = extracted
                    .replace(/\/\/.*$/gm, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/,(\s*[}\]])/g, '$1');
                
                return JSON.parse(extracted);
            }
        } catch (e) {}
        
        throw new Error('Не вдалося розпарсити JSON');
    },
    
    // ========== ДАТА І ЧАС ==========
    
    formatDate(date) {
        return new Date(date).toLocaleString('uk-UA');
    },
    
    // ========== ФАЙЛИ ==========
    
    download(content, filename, type) {
        const blob = new Blob([content], { type: type + ';charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // ========== БУФЕР ОБМІНУ ==========
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (e) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    },
    
    // ========== ЗАТРИМКИ ==========
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // ========== ПОМИЛКИ ==========
    
    isRetryableError(error) {
        const retryableErrors = [
            'failed to fetch',
            'network error',
            'timeout',
            'econnreset',
            'etimedout',
            '429',
            '500',
            '502',
            '503',
            '504'
        ];
        
        const errorMsg = error.message.toLowerCase();
        return retryableErrors.some(err => errorMsg.includes(err));
    },
    
    // ========== ГЕНЕРАТОРИ ==========
    
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },
    
    // ========== СТАТИСТИКА ВІРШІВ ==========
    
    getPoemStats(text) {
        if (!text) return null;
        
        const lines = text.split('\n').filter(l => l.trim());
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        
        // Підрахунок складів у кожному рядку
        const syllablesPerLine = lines.map(line => {
            const lineWords = line.trim().split(/\s+/);
            return lineWords.reduce((sum, word) => sum + this.countSyllables(word), 0);
        });
        
        return {
            lines: lines.length,
            words: words.length,
            syllablesPerLine: syllablesPerLine,
            avgSyllablesPerLine: syllablesPerLine.length > 0 
                ? Math.round(syllablesPerLine.reduce((a, b) => a + b, 0) / syllablesPerLine.length) 
                : 0
        };
    }
};

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
