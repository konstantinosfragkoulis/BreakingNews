import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import path from 'path';

const CACHE_FILE: string = path.join(os.homedir(), '.article_scores.json');

type ArticleScore = {
    title: string;
    score: number;
    pubDate: string;
};

export function hashArticle(title: string): string {
    return crypto.createHash('sha256').update(title).digest('hex');
}

export function saveScore(title: string, score: number, pubDate: string): void {
    const scores = loadScores();
    const hash = hashArticle(title);
    scores[hash] = { title, score, pubDate };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(scores, null, 2));
}

export function loadScores(): Record<string, ArticleScore> {
    if(fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        return JSON.parse(data);
    }
    return {};
}

export function getScore(title: string): number | null {
    const scores = loadScores();
    const hash = hashArticle(title);
    return scores[hash] ? scores[hash].score : null;
}

export function getPubDate(title: string): string | null {
    const scores = loadScores();
    const hash = hashArticle(title);
    return scores[hash] ? scores[hash].pubDate : null;
}