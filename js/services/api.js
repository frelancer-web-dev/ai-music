// ============================================
// API.JS - Комунікація з AI провайдерами
// ============================================

// ========== ГОЛОВНА ФУНКЦІЯ API ==========

async function callAPI(prompt, retryCount = 0) {
    try {
        const apiKey = document.getElementById('apiKey').value;
        if (!apiKey) {
            throw new Error('Введіть API ключ в налаштуваннях!');
        }

        const provider = document.getElementById('apiProvider').value;
        const model = document.getElementById('modelName').value;
        const settings = {
            temperature: parseFloat(document.getElementById('temperature').value)
        };

        const handlers = {
            gemini: callGeminiAPI,
            openai: callOpenAIAPI,
            anthropic: callAnthropicAPI,
            custom: callCustomAPI
        };

        const handler = handlers[provider];
        if (!handler) {
            throw new Error('Невідомий API provider');
        }

        return await handler(apiKey, model, prompt, settings);
        
    } catch (error) {
        if (retryCount < CONFIG.MAX_RETRIES && Utils.isRetryableError(error)) {
            console.log(`Retry ${retryCount + 1}/${CONFIG.MAX_RETRIES}...`);
            await Utils.sleep(CONFIG.RETRY_DELAY);
            return callAPI(prompt, retryCount + 1);
        }
        throw error;
    }
}

// ========== GEMINI API ==========

async function callGeminiAPI(apiKey, model, prompt, settings) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: settings.temperature,
                    maxOutputTokens: 2048
                }
            })
        }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Gemini API помилка: ${data.error?.message || JSON.stringify(data)}`);
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('API повернув порожню відповідь');
    }
    
    return text;
}

// ========== OPENAI API ==========

async function callOpenAIAPI(apiKey, model, prompt, settings) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: settings.temperature,
            max_tokens: 2048
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`OpenAI API помилка: ${data.error?.message || JSON.stringify(data)}`);
    }
    
    return data.choices?.[0]?.message?.content || '';
}

// ========== ANTHROPIC API ==========

async function callAnthropicAPI(apiKey, model, prompt, settings) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: settings.temperature,
            max_tokens: 2048
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Anthropic API помилка: ${data.error?.message || JSON.stringify(data)}`);
    }
    
    return data.content?.[0]?.text || '';
}

// ========== CUSTOM API ==========

async function callCustomAPI(apiKey, model, prompt, settings) {
    const customUrl = document.getElementById('customUrl').value;
    if (!customUrl) {
        throw new Error('Введіть Custom URL в налаштуваннях');
    }
    
    const response = await fetch(customUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: settings.temperature,
            max_tokens: 2048
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`Custom API помилка: ${JSON.stringify(data)}`);
    }
    
    return data.choices?.[0]?.message?.content || data.content || '';
}

// ========== ТЕСТУВАННЯ API ==========

async function testAPI() {
    try {
        showToast('⏳ Тестування API...', 'info');
        const result = await callAPI(Prompts.test());
        showToast('✅ API працює коректно!\n\nВідповідь: ' + Utils.truncate(result, 200), 'success');
    } catch (error) {
        showToast('❌ Помилка API:\n\n' + error.message, 'error');
    }
}
