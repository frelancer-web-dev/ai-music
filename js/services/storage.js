// ============================================
// STORAGE.JS - IndexedDB + шифрування для ШІ-Поет v1.0
// ============================================

let db = null;

const Storage = {
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                showToast('❌ Помилка бази даних: ' + request.error.message, 'error');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            
            request.onblocked = () => {
                showToast('⚠️ База даних заблокована. Закрийте інші вкладки з додатком.', 'warning', 10000);
                console.warn('IndexedDB blocked');
            };
            
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                
                if (!database.objectStoreNames.contains('collections')) {
                    database.createObjectStore('collections', { keyPath: 'id' });
                }
                
                if (!database.objectStoreNames.contains('settings')) {
                    database.createObjectStore('settings', { keyPath: 'key' });
                }
                
                if (!database.objectStoreNames.contains('poems')) {
                    const poemsStore = database.createObjectStore('poems', { keyPath: 'id', autoIncrement: true });
                    poemsStore.createIndex('collectionId', 'collectionId', { unique: false });
                }
            };
        });
    },
    
    async save(storeName, data) {
        if (!db) await this.init();
        
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.put(data);
                
                request.onsuccess = () => resolve(true);
                
                request.onerror = (event) => {
                    const error = event.target.error;
                    console.error('Storage save error:', error);
                    
                    if (error.name === 'QuotaExceededError') {
                        showToast('❌ Сховище переповнене! Видаліть старі збірки.', 'error', 10000);
                    }
                    
                    reject(error);
                };
                
                tx.onerror = (event) => {
                    console.error('Transaction error:', event.target.error);
                    reject(event.target.error);
                };
                
                tx.onabort = (event) => {
                    console.error('Transaction aborted:', event.target.error);
                    reject(new Error('Transaction aborted'));
                };
            } catch (error) {
                console.error('Unexpected error in save:', error);
                reject(error);
            }
        });
    },
    
    async load(storeName, key) {
        try {
            if (!db) await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.get(key);
                
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => {
                    console.error('Storage load error:', request.error);
                    reject(request.error);
                };
            });
        } catch (e) {
            console.error('Storage load error:', e);
            return null;
        }
    },
    
    async remove(storeName, key) {
        try {
            if (!db) await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.delete(key);
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    console.error('Storage remove error:', request.error);
                    reject(request.error);
                };
            });
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    async getAll(storeName) {
        try {
            if (!db) await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => {
                    console.error('Storage getAll error:', request.error);
                    reject(request.error);
                };
            });
        } catch (e) {
            console.error('Storage getAll error:', e);
            return [];
        }
    },
    
    async saveCurrentCollection() {
        try {
            const apiKey = document.getElementById('apiKey').value;
            let encryptedKey = null;
            if (apiKey) {
                encryptedKey = CryptoHelper.encrypt(apiKey);
            }
            
            const collectionId = currentCollectionId || Date.now();
            let existingCollection = null;
            if (currentCollectionId) {
                existingCollection = await this.load('collections', currentCollectionId);
            }
            
            const collection = {
                id: collectionId,
                name: document.getElementById('collectionTitle').value || 'Нова збірка',
                settings: getSettings(),
                lastModified: new Date().toISOString(),
                created: existingCollection?.created || new Date().toISOString(),
                apiKeyEncrypted: encryptedKey,
                stats: {
                    totalPoems: poems.length,
                    totalLines: getTotalLines(),
                    totalWords: getTotalWords()
                }
            };
            
            await this.save('collections', collection);
            
            for (const poem of poems) {
                await this.save('poems', {
                    id: `${collection.id}_${poem.number}`,
                    collectionId: collection.id,
                    ...poem
                });
            }
            
            currentCollectionId = collection.id;
            localStorage.setItem('last_collection_id', collection.id);
            
            return collection;
        } catch (error) {
            console.error('Save collection error:', error);
            showToast('❌ Помилка збереження: ' + error.message, 'error');
            throw error;
        }
    },
    
    async loadCollection(collectionId) {
        try {
            const collection = await this.load('collections', collectionId);
            if (!collection) return null;
            
            currentCollectionId = collectionId;
            
            if (collection.apiKeyEncrypted) {
                const decryptedKey = CryptoHelper.decrypt(collection.apiKeyEncrypted);
                if (decryptedKey) {
                    document.getElementById('apiKey').value = decryptedKey;
                }
            }
            
            applySettings(collection.settings);
            
            const allPoems = await this.getAll('poems');
            poems = allPoems.filter(p => p.collectionId === collectionId);
            
            return collection;
        } catch (error) {
            console.error('Load collection error:', error);
            showToast('❌ Помилка завантаження збірки', 'error');
            return null;
        }
    },
    
    async deleteCollection(collectionId) {
        try {
            await this.remove('collections', collectionId);
            
            const allPoems = await this.getAll('poems');
            for (const poem of allPoems) {
                if (poem.collectionId === collectionId) {
                    await this.remove('poems', poem.id);
                }
            }
            
            if (currentCollectionId === collectionId) {
                currentCollectionId = null;
                poems = [];
            }
        } catch (error) {
            console.error('Delete collection error:', error);
            showToast('❌ Помилка видалення збірки', 'error');
        }
    },
    
    async getAllCollections() {
        try {
            const collections = await this.getAll('collections');
            return collections.map(c => ({
                id: c.id,
                name: c.name,
                poemsCount: c.stats?.totalPoems || 0,
                lastModified: c.lastModified,
                totalLines: c.stats?.totalLines || 0,
                totalWords: c.stats?.totalWords || 0
            })).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        } catch (error) {
            console.error('Get collections error:', error);
            return [];
        }
    },
    
    async exportBackup() {
        try {
            const collections = await this.getAll('collections');
            const allPoems = await this.getAll('poems');
            
            const backup = {
                version: CONFIG.DB_VERSION,
                timestamp: new Date().toISOString(),
                collections: collections,
                poems: allPoems
            };
            
            const json = JSON.stringify(backup, null, 2);
            const compressed = LZString.compressToBase64(json);
            Utils.download(compressed, `aipoet_backup_${Date.now()}.bak`, 'text/plain');
            showToast('✅ Backup створено!', 'success');
        } catch (e) {
            console.error('Export backup error:', e);
            showToast('❌ Помилка створення backup: ' + e.message, 'error');
        }
    },
    
    async importBackup(file) {
        try {
            const text = await file.text();
            const decompressed = LZString.decompressFromBase64(text);
            
            if (!decompressed) {
                throw new Error('Не вдалося розпакувати backup файл');
            }
            
            const backup = JSON.parse(decompressed);
            
            if (!backup.collections || !backup.poems) {
                throw new Error('Невірна структура backup файлу');
            }
            
            for (const collection of backup.collections) {
                await this.save('collections', collection);
            }
            
            for (const poem of backup.poems) {
                await this.save('poems', poem);
            }
            
            showToast('✅ Backup відновлено!', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (e) {
            console.error('Import backup error:', e);
            showToast('❌ Помилка відновлення: ' + e.message, 'error');
        }
    }
};

// ========== СПРОЩЕНЕ ШИФРУВАННЯ ==========
const CryptoHelper = {
    encrypt(text) {
        try {
            return btoa(encodeURIComponent(text));
        } catch (e) {
            console.error('Encryption error:', e);
            return null;
        }
    },
    
    decrypt(encryptedText) {
        try {
            return decodeURIComponent(atob(encryptedText));
        } catch (e) {
            console.error('Decryption error:', e);
            return null;
        }
    }
};

function getTotalLines() {
    return poems.reduce((sum, p) => sum + Utils.countLines(p.content), 0);
}

function getTotalWords() {
    return poems.reduce((sum, p) => sum + Utils.countWords(p.content), 0);
}

// ========== LZSTRING ==========
const LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();
