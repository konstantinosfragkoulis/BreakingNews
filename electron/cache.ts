import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import path from 'path';

import { getUserInterests, getUserNotInterests } from './UserPreferences';
import { AppSettings, ArticleScores, CacheData, Feed } from './types';

const CACHE_FILE: string = path.join(os.homedir(), '.breakingnews.json');

export function hashArticle(title: string): string {
    return crypto.createHash('sha256').update(title).digest('hex');
}

export function hashPreferences(interests: string[], notInterests: string[]): string {
    const interestsHash = crypto.createHash('sha256').update(interests.sort().join(',')).digest('hex');
    const notInterestsHash = crypto.createHash('sha256').update(notInterests.sort().join(',')).digest('hex');
    const combined = crypto.createHash('sha256').update(`${interestsHash}:${notInterestsHash}`).digest('hex');
    return combined;
}

export function loadCacheData(): CacheData {
    if(fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        const parsedData: CacheData = JSON.parse(data);

        return {
            articles: parsedData.articles || {},
            settings: parsedData.settings || {
                theme: 'system',
                feeds: [],
                userInterests: [],
                userNotInterests: []
            }
        };
    }
    return {
        articles: {},
        settings: {
            theme: 'system',
            feeds: [],
            userInterests: [],
            userNotInterests: []
        }
    };
}

export function saveCacheData(data: CacheData): void {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

export function saveScore(title: string, score: number, pubDate: string): void {
    const data = loadCacheData();
    const hash = hashArticle(title);
    const preferencesHash = hashPreferences(getUserInterests(), getUserNotInterests());
    
    if(!data.articles[hash]) {
        data.articles[hash] = {
            title,
            pubDate,
            scores: {}
        };
    }

    data.articles[hash].scores[preferencesHash] = score;
    saveCacheData(data);
}

export function getScore(articleHash: string, preferencesHash: string): number | null {
    const data = loadCacheData();
    const article = data.articles[articleHash];
    
    if(article && article.scores[preferencesHash] !== undefined) {
        return article.scores[preferencesHash];
    }
    return null;
}

export function getPubDate(title: string): string | null {
    const data = loadCacheData();
    const hash = hashArticle(title);
    const article = data.articles[hash];
    return article ? article.pubDate : null;
}

export function saveUserPreferences(interests: string[], notInterests: string[]): void {
    const data = loadCacheData();
    data.settings.userInterests = interests;
    data.settings.userNotInterests = notInterests;
    saveCacheData(data);
}

export function loadUserPreferences(): { interests: string[], notInterests: string[] } {
    const data = loadCacheData();
    return {
        interests: data.settings.userInterests,
        notInterests: data.settings.userNotInterests
    };
}

export function saveFeeds(feeds: Feed[]): void {
    const data = loadCacheData();
    data.settings.feeds = feeds;
    saveCacheData(data);
}

export function loadFeeds(): Feed[] {
    const data = loadCacheData();
    return data.settings.feeds || [];
}

export function loadSettings(): AppSettings {
    const data = loadCacheData();
    return data.settings || {
        theme: 'system',
        feeds: [],
        userInterests: [],
        userNotInterests: [],
    };
}

export function saveSettings(settings: AppSettings): void {
    const data = loadCacheData();
    data.settings = settings;
    saveCacheData(data);
}

export function getEnabledFeeds(): Feed[] {
    const settings = loadSettings();
    return settings.feeds.filter(feed => feed.enabled);
}

export function prune(): void {
    const data = loadCacheData();
    const old = new Date();
    old.setDate(old.getDate() - 7);

    let pruned = 0;
    const articlesToKeep: Record<string, ArticleScores> = {};

    for(const [hash, article] of Object.entries(data.articles)) {
        const articleDate = new Date(article.pubDate);
        if(articleDate >= old) {
            articlesToKeep[hash] = article;
        }
        else {
            pruned++;
        }
    }

    if(pruned > 0) {
        console.log(`Pruned ${pruned} old articles from cache.`);
        data.articles = articlesToKeep;
        saveCacheData(data);
    }
}