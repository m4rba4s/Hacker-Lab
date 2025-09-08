/**
 * LocalStorage utilities for Hacker Lab
 */
export const LS = {
    /**
     * Get data from localStorage with fallback
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Parsed data or default value
     */
    get(key, defaultValue = {}) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('LocalStorage get error:', error);
            return defaultValue;
        }
    },

    /**
     * Set data in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('LocalStorage set error:', error);
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('LocalStorage remove error:', error);
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('LocalStorage clear error:', error);
        }
    }
};

// Storage keys
export const STORAGE_KEYS = {
    PROGRESS: 'hl_progress_v2',
    NOTES: 'hl_notes_v1',
    QODER_LESSONS: 'hl_custom_lessons_v2',
    SETTINGS: 'hl_settings_v1'
};

// Export Storage as alias for LS (for backward compatibility)
export const Storage = LS;

// Progress management
export const Progress = {
    load() {
        return LS.get(STORAGE_KEYS.PROGRESS, {});
    },

    save(lessonId, completed = true) {
        const progress = this.load();
        progress[lessonId] = { completed, timestamp: Date.now() };
        LS.set(STORAGE_KEYS.PROGRESS, progress);
        return progress;
    },

    isCompleted(lessonId) {
        const progress = this.load();
        return progress[lessonId]?.completed || false;
    },

    getCompletedCount() {
        const progress = this.load();
        return Object.values(progress).filter(p => p.completed).length;
    },

    export() {
        return {
            progress: this.load(),
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
    },

    import(data) {
        if (data.progress) {
            LS.set(STORAGE_KEYS.PROGRESS, data.progress);
            return true;
        }
        return false;
    }
};