import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import path from 'path';

import { getUserInterests, getUserNotInterests } from './UserPreferences';

const CACHE_FILE: string = path.join(os.homedir(), '.breakingnews.json');

type ArticleScores = {
    title: string;
    pubDate: string;
    scores: Record<string, number>;
};

type CacheData = {
    articles: Record<string, ArticleScores>;
    userInterests: string[];
    userNotInterests: string[];
};

export function hashArticle(title: string): string {
    return crypto.createHash('sha256').update(title).digest('hex');
}

export function hashPreferences(interests: string[], notInterests: string[]): string {
    const combined = [...interests, ...notInterests].sort().join(',');
    return crypto.createHash('sha256').update(combined).digest('hex');
}

export function loadCacheData(): CacheData {
    if(fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        const parsedData: CacheData = JSON.parse(data);

        return {
            articles: parsedData.articles || {},
            userInterests: parsedData.userInterests || [],
            userNotInterests: parsedData.userNotInterests || [],
        };
    }
    return {
        articles: {},
        userInterests: [],
        userNotInterests: [],
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
    data.userInterests = interests;
    data.userNotInterests = notInterests;
    saveCacheData(data);
}

export function loadUserPreferences(): { interests: string[], notInterests: string[] } {
    const data = loadCacheData();
    return {
        interests: data.userInterests,
        notInterests: data.userNotInterests
    };
}