// ============================================
// LOCALE.JS - Менеджер мовних налаштувань
// ============================================

const LOCALE = {
    current: 'uk',
    
    // Мовні пакети
    strings: {
        uk: {
            // Загальні
            appName: 'ШІ-Музикант',
            settings: 'Налаштування',
            templates: 'Шаблони',
            generate: 'Згенерувати',
            export: 'Експорт',
            language: 'Мова',
            languageName: 'Українська',
            save: 'Зберегти',
            cancel: 'Скасувати',
            close: 'Закрити',
            loading: 'Завантаження...',
            
            // Налаштування API
            apiSettings: 'Налаштування API',
            apiProvider: 'Провайдер API',
            apiKey: 'Ключ API',
            model: 'Модель',
            temperature: 'Температура',
            maxTokens: 'Макс. токенів',
            
            // Параметри альбому
            albumParams: 'Параметри альбому',
            albumTitle: 'Назва альбому',
            artistName: 'Ім\'я виконавця',
            albumTheme: 'Тема альбому',
            genre: 'Жанр',
            mood: 'Настрій',
            
            // Помилки та повідомлення
            error: 'Помилка',
            success: 'Успіх',
            warning: 'Попередження',
            info: 'Інформація',
            
            // Кнопки та дії
            newAlbum: 'Новий альбом',
            openAlbum: 'Відкрити альбом',
            saveAlbum: 'Зберегти альбом',
            generateLyrics: 'Згенерувати текст',
            generateMelody: 'Згенерувати мелодію',
            
            // Підказки
            enterApiKey: 'Введіть свій API ключ',
            selectModel: 'Виберіть модель',
            
            // Підписи до полів
            title: 'Назва',
            description: 'Опис',
            duration: 'Тривалість',
            bpm: 'BPM',
            
            // Підказки для користувача
            hintStart: 'Почніть з вибору налаштувань',
            hintGenerate: 'Натисніть "Згенерувати" для створення музики',
            
            // Статуси
            generating: 'Генерація...',
            saving: 'Збереження...',
            saved: 'Збережено',
            errorSaving: 'Помилка збереження',
            
            // Інші елементи
            version: 'Версія',
            theme: 'Тема',
            lightTheme: 'Світла',
            darkTheme: 'Темна',
            
            // Підтвердження
            confirmDelete: 'Ви впевнені, що хочете це видалити?',
            confirmClose: 'Усі незбережені зміни будуть втрачені. Продовжити?',
            
            // Додаткові переклади
            ukrainian: 'Українська',
            english: 'English',
            russian: 'Русский',
            
            // Новий контент
            appTitle: 'ШІ-Музикант - Генератор текстів пісень',
            appDescription: 'Генератор текстів пісень з використанням ШІ',
            songs: 'пісень',
            lines: 'рядків',
            showPassword: 'Показати пароль',
            songStructures: 'Структури пісень',
            newTemplate: 'Новий шаблон',
            generation: 'Генерація',
            generateLyrics: 'Згенерувати тексти пісень',
            generatePrompt: 'Натисніть кнопку "Згенерувати тексти пісень", щоб почати.',
            preview: 'Попередній перегляд',
            noPreview: 'Немає даних для перегляду. Спочатку згенеруйте вміст.',
            exportToTXT: 'Експортувати у TXT',
            exportToDOCX: 'Експортувати у DOCX',
            exportToPDF: 'Експортувати у PDF',
            generatingXofY: 'Генерація {current} з {total}...',
            noTemplates: 'Немає збережених шаблонів. Створіть новий шаблон.',
            
            // Підказки та плейсхолдери
            enterApiKey: 'Введіть API ключ',
            selectModel: 'Виберіть модель',
            enterAlbumTitle: 'Введіть назву альбому...',
            enterArtistName: "Введіть ім'я виконавця...",
            describeAlbumTheme: 'Опишіть тему альбому...',
            enterAdditionalDetails: 'Додаткові деталі...',
            
            // Статуси
            saved: 'Збережено',
            saving: 'Збереження...',
            generating: 'Генерація...',
            
            // Помилки
            error: 'Помилка',
            errorSaving: 'Помилка збереження',
            
            // Підтвердження
            confirmDelete: 'Ви впевнені, що хочете це видалити?',
            confirmClose: 'Усі незбережені зміни будуть втрачені. Продовжити?',
            
            // Жанри
            genrePop: 'Поп',
            genreRock: 'Рок',
            genreHiphop: 'Хіп-хоп',
            genreElectronic: 'Електронна',
            genreJazz: 'Джаз',
            genreClassical: 'Класика',
            genreOther: 'Інше',
            
            // Настрої
            moodHappy: 'Веселий',
            moodSad: 'Сумний',
            moodRomantic: 'Романтичний',
            moodEnergetic: 'Енергійний',
            moodCalm: 'Спокійний'
        },
        en: {
            // General
            appName: 'AI Musician',
            settings: 'Settings',
            templates: 'Templates',
            generate: 'Generate',
            export: 'Export',
            language: 'Language',
            languageName: 'English',
            save: 'Save',
            cancel: 'Cancel',
            close: 'Close',
            loading: 'Loading...',
            
            // API Settings
            apiSettings: 'API Settings',
            apiProvider: 'API Provider',
            apiKey: 'API Key',
            model: 'Model',
            temperature: 'Temperature',
            maxTokens: 'Max Tokens',
            
            // Album Parameters
            albumParams: 'Album Parameters',
            albumTitle: 'Album Title',
            artistName: 'Artist Name',
            albumTheme: 'Album Theme',
            genre: 'Genre',
            mood: 'Mood',
            
            // Errors and Messages
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Information',
            
            // Buttons and Actions
            newAlbum: 'New Album',
            openAlbum: 'Open Album',
            saveAlbum: 'Save Album',
            generateLyrics: 'Generate Lyrics',
            generateMelody: 'Generate Melody',
            
            // Hints
            enterApiKey: 'Enter your API key',
            selectModel: 'Select model',
            
            // Field Labels
            title: 'Title',
            description: 'Description',
            duration: 'Duration',
            bpm: 'BPM',
            
            // User Hints
            hintStart: 'Start by selecting settings',
            hintGenerate: 'Click "Generate" to create music',
            
            // Statuses
            generating: 'Generating...',
            saving: 'Saving...',
            saved: 'Saved',
            errorSaving: 'Error saving',
            
            // Other Elements
            version: 'Version',
            theme: 'Theme',
            lightTheme: 'Light',
            darkTheme: 'Dark',
            
            // Confirmations
            confirmDelete: 'Are you sure you want to delete this?',
            confirmClose: 'All unsaved changes will be lost. Continue?',
            
            // Additional Translations
            ukrainian: 'Українська',
            english: 'English',
            russian: 'Русский',
            
            // New content
            appTitle: 'AI Musician - Song Lyrics Generator',
            appDescription: 'AI-powered song lyrics generator',
            songs: 'songs',
            lines: 'lines',
            showPassword: 'Show password',
            songStructures: 'Song Structures',
            newTemplate: 'New Template',
            generation: 'Generation',
            generateLyrics: 'Generate Song Lyrics',
            generatePrompt: 'Click "Generate Song Lyrics" to get started.',
            preview: 'Preview',
            noPreview: 'No data to preview. Please generate content first.',
            exportToTXT: 'Export to TXT',
            exportToDOCX: 'Export to DOCX',
            exportToPDF: 'Export to PDF',
            generatingXofY: 'Generating {current} of {total}...',
            noTemplates: 'No saved templates. Create a new template.',
            
            // Hints and placeholders
            enterApiKey: 'Enter API key',
            selectModel: 'Select model',
            enterAlbumTitle: 'Enter album title...',
            enterArtistName: 'Enter artist name...',
            describeAlbumTheme: 'Describe the album theme...',
            enterAdditionalDetails: 'Additional details...',
            
            // Statuses
            saved: 'Saved',
            saving: 'Saving...',
            generating: 'Generating...',
            
            // Errors
            error: 'Error',
            errorSaving: 'Error saving',
            
            // Confirmations
            confirmDelete: 'Are you sure you want to delete this?',
            confirmClose: 'All unsaved changes will be lost. Continue?',
            
            // Genres
            genrePop: 'Pop',
            genreRock: 'Rock',
            genreHiphop: 'Hip-hop',
            genreElectronic: 'Electronic',
            genreJazz: 'Jazz',
            genreClassical: 'Classical',
            genreOther: 'Other',
            
            // Moods
            moodHappy: 'Happy',
            moodSad: 'Sad',
            moodRomantic: 'Romantic',
            moodEnergetic: 'Energetic',
            moodCalm: 'Calm'
        },
        ru: {
            // Общие
            appName: 'ИИ-Музыкант',
            settings: 'Настройки',
            templates: 'Шаблоны',
            generate: 'Сгенерировать',
            export: 'Экспорт',
            language: 'Язык',
            languageName: 'Русский',
            save: 'Сохранить',
            cancel: 'Отмена',
            close: 'Закрыть',
            loading: 'Загрузка...',
            
            // Настройки API
            apiSettings: 'Настройки API',
            apiProvider: 'Провайдер API',
            apiKey: 'Ключ API',
            model: 'Модель',
            temperature: 'Температура',
            maxTokens: 'Макс. токенов',
            
            // Параметры альбома
            albumParams: 'Параметры альбома',
            albumTitle: 'Название альбома',
            artistName: 'Имя исполнителя',
            albumTheme: 'Тема альбома',
            genre: 'Жанр',
            mood: 'Настроение',
            
            // Ошибки и сообщения
            error: 'Ошибка',
            success: 'Успех',
            warning: 'Предупреждение',
            info: 'Информация',
            
            // Кнопки и действия
            newAlbum: 'Новый альбом',
            openAlbum: 'Открыть альбом',
            saveAlbum: 'Сохранить альбом',
            generateLyrics: 'Сгенерировать текст',
            generateMelody: 'Сгенерировать мелодию',
            
            // Подсказки
            enterApiKey: 'Введите ваш API ключ',
            selectModel: 'Выберите модель',
            
            // Подписи к полям
            title: 'Название',
            description: 'Описание',
            duration: 'Длительность',
            bpm: 'BPM',
            
            // Подсказки для пользователя
            hintStart: 'Начните с выбора настроек',
            hintGenerate: 'Нажмите "Сгенерировать" для создания музыки',
            
            // Статусы
            generating: 'Генерация...',
            saving: 'Сохранение...',
            saved: 'Сохранено',
            errorSaving: 'Ошибка сохранения',
            
            // Другие элементы
            version: 'Версия',
            theme: 'Тема',
            lightTheme: 'Светлая',
            darkTheme: 'Темная',
            
            // Подтверждения
            confirmDelete: 'Вы уверены, что хотите это удалить?',
            confirmClose: 'Все несохраненные изменения будут потеряны. Продолжить?',
            
            // Дополнительные переводы
            ukrainian: 'Українська',
            english: 'English',
            russian: 'Русский',
            
            // Новый контент
            appTitle: 'ИИ-Музыкант - Генератор текстов песен',
            appDescription: 'Генератор текстов песен с использованием ИИ',
            songs: 'песен',
            lines: 'строк',
            showPassword: 'Показать пароль',
            songStructures: 'Структуры песен',
            newTemplate: 'Новый шаблон',
            generation: 'Генерация',
            generateLyrics: 'Сгенерировать тексты песен',
            generatePrompt: 'Нажмите кнопку "Сгенерировать тексты песен", чтобы начать.',
            preview: 'Предпросмотр',
            noPreview: 'Нет данных для просмотра. Сначала сгенерируйте контент.',
            exportToTXT: 'Экспорт в TXT',
            exportToDOCX: 'Экспорт в DOCX',
            exportToPDF: 'Экспорт в PDF',
            generatingXofY: 'Генерация {current} из {total}...',
            noTemplates: 'Нет сохраненных шаблонов. Создайте новый шаблон.',
            
            // Подсказки и плейсхолдеры
            enterApiKey: 'Введите API ключ',
            selectModel: 'Выберите модель',
            enterAlbumTitle: 'Введите название альбома...',
            enterArtistName: 'Введите имя исполнителя...',
            describeAlbumTheme: 'Опишите тему альбома...',
            enterAdditionalDetails: 'Дополнительные детали...',
            
            // Статусы
            saved: 'Сохранено',
            saving: 'Сохранение...',
            generating: 'Генерация...',
            
            // Ошибки
            error: 'Ошибка',
            errorSaving: 'Ошибка сохранения',
            
            // Подтверждения
            confirmDelete: 'Вы уверены, что хотите это удалить?',
            confirmClose: 'Все несохраненные изменения будут потеряны. Продолжить?',
            
            // Жанры
            genrePop: 'Поп',
            genreRock: 'Рок',
            genreHiphop: 'Хип-хоп',
            genreElectronic: 'Электронная',
            genreJazz: 'Джаз',
            genreClassical: 'Классика',
            genreOther: 'Другое',
            
            // Настроения
            moodHappy: 'Веселый',
            moodSad: 'Грустный',
            moodRomantic: 'Романтичный',
            moodEnergetic: 'Энергичный',
            moodCalm: 'Спокойный'
        }
    },

    // Ініціалізація
    init() {
        // Спробуємо отримати збережену мову з localStorage
        const savedLang = localStorage.getItem('appLanguage');
        if (savedLang && this.strings[savedLang]) {
            this.current = savedLang;
        }
        this.updateUI();
    },

    // Встановити мову
    setLanguage(lang) {
        if (this.strings[lang]) {
            this.current = lang;
            localStorage.setItem('appLanguage', lang);
            this.updateUI();
            return true;
        }
        return false;
    },

    // Отримати поточну мову
    getLanguage() {
        return this.current;
    },

    // Отримати переклад
    t(key) {
        return this.strings[this.current][key] || key;
    },

    // Оновити інтерфейс
    updateUI() {
        // Оновлюємо атрибут lang у html
        document.documentElement.lang = this.current;
        
        // Оновлюємо всі елементи з атрибутом data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.t(key);
            }
        });
        
        // Оновлюємо плейсхолдери
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.placeholder = this.t(key);
            }
        });
        
        // Оновлюємо значення атрибутів title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.title = this.t(key);
            }
        });
        
        // Оновлюємо вибрану мову у селекторі
        const langSelect = document.getElementById('language-selector');
        if (langSelect) {
            langSelect.value = this.current;
        }
    }
};

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => LOCALE.init());

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOCALE;
} else {
    window.LOCALE = LOCALE;
}
