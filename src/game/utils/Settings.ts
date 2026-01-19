
import { GameSettings } from '../types';

const SETTINGS_KEY = 'shadows_1920s_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
    audio: {
        masterVolume: 80,
        musicVolume: 60,
        sfxVolume: 100,
        muted: false
    },
    graphics: {
        highContrast: false,
        reduceMotion: false,
        particles: true
    },
    gameplay: {
        showGrid: true,
        fastMode: false
    }
};

export const loadSettings = (): GameSettings => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            // Deep merge to ensure new keys in default settings are present if missing in saved
            const parsed = JSON.parse(saved);
            return {
                audio: { ...DEFAULT_SETTINGS.audio, ...parsed.audio },
                graphics: { ...DEFAULT_SETTINGS.graphics, ...parsed.graphics },
                gameplay: { ...DEFAULT_SETTINGS.gameplay, ...parsed.gameplay }
            };
        }
    } catch (e) {
        console.warn("Failed to load settings", e);
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: GameSettings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn("Failed to save settings", e);
    }
};
