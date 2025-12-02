// ============================================
// PROMPTS.JS - Промпти для генерації пісень
// ============================================

// Мовні налаштування за замовчуванням
const DEFAULT_LANGUAGE = 'uk';

// Словник мовних налаштувань
const LANGUAGE_SETTINGS = {
    uk: {
        name: 'українською',
        structure: {
            verse: 'Куплет',
            chorus: 'Приспів',
            bridge: 'Бридж',
            intro: 'Вступ',
            outro: 'Завершення'
        },
        prompts: {
            test: 'Напиши одне коротке речення українською про музику.',
            poem: (params) => {
                let prompt = `Напиши текст пісні українською мовою.\n\nТема: ${params.theme}\nНастрій: ${params.mood}\nЖанр: ${params.style}`;

                if (params.template) {
                    const template = params.template;
                    prompt += `\nСтруктура: ${template.name}`;
                    
                    if (template.structure) {
                        prompt += `\nФорма: ${template.structure}`;
                    }
                }
                
                if (params.additionalDetails) {
                    prompt += `\nДодаткові вимоги: ${params.additionalDetails}`;
                }
                
                if (params.poemNumber) {
                    prompt += `\n\nЦе пісня №${params.poemNumber} з альбому.`;
                }

                prompt += `\n\n⚠️ ВАЖЛИВО: 
- Поверни ТІЛЬКИ текст пісні без назви
- Використовуй позначки [Куплет 1], [Приспів], [Бридж] тощо для структури
- Рими мають бути природними
- Текст має співатися
- Без пояснень та коментарів`;
                
                return prompt;
            },
            poemTitle: (params) => {
                return `Придумай яскраву назву для пісні на тему "${params.theme}" в ${params.mood} настрої для жанру ${params.style}.\n\n⚠️ ВАЖЛИВО: Поверни тільки назву, одну коротку фразу (2-4 слова), без лапок, без пояснень.`;
            },
            improvePoem: (text) => `Покращ текст пісні, зберігаючи зміст та структуру:\n\n${text}\n\nПокращений варіант (без коментарів):`,
            continuePoem: (text, lines) => `Додай ще ${lines} рядків до цього тексту пісні, зберігаючи стиль та тему:\n\n${text}\n\nПродовження (без коментарів):`,
            findRhyme: (word) => `Знайди риму до слова "${word}". Поверни тільки список слів-рим, розділених комами, без пояснень.`,
            findSynonyms: (word) => `Знайди синоніми до слова "${word}". Поверни тільки список слів, розділених комами, без пояснень.`,
            analyzeMeter: (text) => `Проаналізуй ритм наведеного тексту пісні та поверни результат у форматі: "Розмір: [назва розміру]\nРитм: [опис ритму]\nРекомендації: [поради щодо покращення]".\n\n${text}`,
            collectionIntro: (params) => `Напиши короткий вступ до музичного альбому під назвою "${params.title}" у жанрі ${params.genre} з наступним описом: ${params.description}.`,
            generateThematicSet: (params) => `Придумай ${params.count} назв пісень для альбому на тему "${params.theme}" у жанрі ${params.genre}.`,
            generateHook: (theme, mood) => `Придумай причіпляючий куплет (хук) для пісні на тему "${theme}" у ${mood} настрої.`,
            generateBridge: (verseText) => `На основі наведеного куплету створи бридж, який логічно продовжить пісню:\n\n${verseText}\n\nБридж (без коментарів):`
        }
    },
    en: {
        name: 'English',
        structure: {
            verse: 'Verse',
            chorus: 'Chorus',
            bridge: 'Bridge',
            intro: 'Intro',
            outro: 'Outro'
        },
        prompts: {
            test: 'Write one short sentence in English about music.',
            poem: (params) => {
                let prompt = `Write song lyrics in English.\n\nTheme: ${params.theme}\nMood: ${params.mood}\nGenre: ${params.style}`;

                if (params.template) {
                    const template = params.template;
                    prompt += `\nStructure: ${template.name}`;
                    
                    if (template.structure) {
                        prompt += `\nForm: ${template.structure}`;
                    }
                }
                
                if (params.additionalDetails) {
                    prompt += `\nAdditional requirements: ${params.additionalDetails}`;
                }
                
                if (params.poemNumber) {
                    prompt += `\n\nThis is song #${params.poemNumber} from the album.`;
                }

                prompt += `\n\n⚠️ IMPORTANT: 
- Return ONLY the song lyrics without a title
- Use labels like [Verse 1], [Chorus], [Bridge] for structure
- Rhymes should sound natural
- The text should be singable
- No explanations or comments`;
                
                return prompt;
            },
            poemTitle: (params) => {
                return `Come up with a catchy title for a song about "${params.theme}" with a ${params.mood} mood in the ${params.style} genre.\n\nIMPORTANT: Return only the title, one short phrase (2-4 words), without quotes or explanations.`;
            },
            improvePoem: (text) => `Improve the following song lyrics while maintaining the meaning and structure:\n\n${text}\n\nImproved version (no comments):`,
            continuePoem: (text, lines) => `Add ${lines} more lines to this song, maintaining the style and theme:\n\n${text}\n\nContinuation (no comments):`,
            findRhyme: (word) => `Find rhymes for the word "${word}". Return only a comma-separated list of rhyming words, no explanations.`,
            findSynonyms: (word) => `Find synonyms for the word "${word}". Return only a comma-separated list of words, no explanations.`,
            analyzeMeter: (text) => `Analyze the meter of the following song lyrics and return the result in the format: "Meter: [meter name]\nRhythm: [rhythm description]\nRecommendations: [improvement suggestions]".\n\n${text}`,
            collectionIntro: (params) => `Write a short introduction for a music album titled "${params.title}" in the ${params.genre} genre with the following description: ${params.description}.`,
            generateThematicSet: (params) => `Generate ${params.count} song titles for an album about "${params.theme}" in the ${params.genre} genre.`,
            generateHook: (theme, mood) => `Come up with a catchy hook for a song about "${theme}" with a ${mood} mood.`,
            generateBridge: (verseText) => `Based on the following verse, create a bridge that logically continues the song:\n\n${verseText}\n\nBridge (no comments):`
        }
    },
    ru: {
        name: 'русском',
        structure: {
            verse: 'Куплет',
            chorus: 'Припев',
            bridge: 'Бридж',
            intro: 'Вступление',
            outro: 'Завершение'
        },
        prompts: {
            test: 'Напиши одно короткое предложение на русском о музыке.',
            poem: (params) => {
                let prompt = `Напиши текст песни на русском языке.\n\nТема: ${params.theme}\nНастроение: ${params.mood}\nЖанр: ${params.style}`;

                if (params.template) {
                    const template = params.template;
                    prompt += `\nСтруктура: ${template.name}`;
                    
                    if (template.structure) {
                        prompt += `\nФорма: ${template.structure}`;
                    }
                }
                
                if (params.additionalDetails) {
                    prompt += `\nДополнительные требования: ${params.additionalDetails}`;
                }
                
                if (params.poemNumber) {
                    prompt += `\n\nЭто песня №${params.poemNumber} из альбома.`;
                }

                prompt += `\n\n⚠️ ВАЖНО: 
- Верни ТОЛЬКО текст песни без названия
- Используй пометки [Куплет 1], [Припев], [Бридж] и т.д. для структуры
- Рифмы должны быть естественными
- Текст должен быть удобен для пения
- Без объяснений и комментариев`;
                
                return prompt;
            },
            poemTitle: (params) => {
                return `Придумай яркое название для песни на тему "${params.theme}" в ${params.mood} настроении для жанра ${params.style}.\n\nВАЖНО: Верни только название, одну короткую фразу (2-4 слова), без кавычек, без объяснений.`;
            },
            improvePoem: (text) => `Улучши текст песни, сохраняя содержание и структуру:\n\n${text}\n\nУлучшенный вариант (без комментариев):`,
            continuePoem: (text, lines) => `Добавь еще ${lines} строк к этому тексту песни, сохраняя стиль и тему:\n\n${text}\n\nПродолжение (без комментариев):`,
            findRhyme: (word) => `Найди рифму к слову "${word}". Верни только список слов-рифм, разделенных запятыми, без объяснений.`,
            findSynonyms: (word) => `Найди синонимы к слову "${word}". Верни только список слов, разделенных запятыми, без объяснений.`,
            analyzeMeter: (text) => `Проанализируй ритм приведенного текста песни и верни результат в формате: "Размер: [название размера]\nРитм: [описание ритма]\nРекомендации: [советы по улучшению]".\n\n${text}`,
            collectionIntro: (params) => `Напиши краткое вступление к музыкальному альбому под названием "${params.title}" в жанре ${params.genre} со следующим описанием: ${params.description}.`,
            generateThematicSet: (params) => `Придумай ${params.count} названий песен для альбома на тему "${params.theme}" в жанре ${params.genre}.`,
            generateHook: (theme, mood) => `Придумай цепляющий куплет (хук) для песни на тему "${theme}" в ${mood} настроении.`,
            generateBridge: (verseText) => `На основе приведенного куплета создай бридж, который логично продолжит песню:\n\n${verseText}\n\nБридж (без комментариев):`
        }
    }
};

const Prompts = {
    // Отримання поточного об'єкту мови
    _getLanguageSettings: function(language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        return LANGUAGE_SETTINGS[language] || LANGUAGE_SETTINGS[DEFAULT_LANGUAGE];
    },

    // Отримання структури для поточної мови
    getStructure: function(language) {
        return this._getLanguageSettings(language).structure;
    },

    // ========== ТЕСТ API ==========
    test: function(language) {
        return this._getLanguageSettings(language).prompts.test;
    },
    
    // ========== ГЕНЕРАЦІЯ ТЕКСТУ ПІСНІ ==========
    poem: function(params, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.poem(params);
    },
    
    // ========== ГЕНЕРАЦІЯ НАЗВИ ПІСНІ ==========
    poemTitle: function(params, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.poemTitle(params);
    },
    
    // ========== ПОКРАЩЕННЯ ТЕКСТУ ==========
    improvePoem: function(text, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.improvePoem(text);
    },
    
    // ========== ДОДАВАННЯ КУПЛЕТА ==========
    continuePoem: function(text, lines, language) {
        lines = lines || 4;
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.continuePoem(text, lines);
    },
    
    // ========== ГЕНЕРАЦІЯ РИМИ ==========
    findRhyme: function(word, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.findRhyme(word);
    },
    
    // ========== СИНОНІМИ ==========
    findSynonyms: function(word, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.findSynonyms(word);
    },
    
    // ========== АНАЛІЗ РИТМУ ==========
    analyzeMeter: function(text, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.analyzeMeter(text);
    },
    
    // ========== ГЕНЕРАЦІЯ ВСТУПУ ДО АЛЬБОМУ ==========
    collectionIntro: function(params, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.collectionIntro(params);
    },
    
    // ========== ГЕНЕРАЦІЯ НАЗВ ПІСЕНЬ ==========
    generateThematicSet: function(params, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.generateThematicSet(params);
    },
    
    // ========== ГЕНЕРАЦІЯ ХУКУ ==========
    generateHook: function(theme, mood, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.generateHook(theme, mood);
    },
    
    // ========== ГЕНЕРАЦІЯ БРИДЖУ ==========
    generateBridge: function(verseText, language) {
        language = language || (typeof LOCALE !== 'undefined' ? LOCALE.getLanguage() : DEFAULT_LANGUAGE);
        const settings = this._getLanguageSettings(language);
        return settings.prompts.generateBridge(verseText);
    }
};

// Експорт для Node.js (якщо потрібно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Prompts;
}