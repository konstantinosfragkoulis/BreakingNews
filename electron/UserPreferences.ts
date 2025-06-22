import { saveUserPreferences, loadUserPreferences } from "./cache";

var INTERESTS: string[] = [];
var NOT_INTERESTED: string[] = [];

export function getUserInterests(): string[] {
    return INTERESTS;
}

export function getUserNotInterests(): string[] {
    return NOT_INTERESTED;
}

export function setUserInterest(newInterests: string[]): string[] {
    INTERESTS = newInterests;
    saveUserPreferences(INTERESTS, NOT_INTERESTED);
    return INTERESTS;
}

export function setUserNotInterests(newInterests: string[]): string[] {
    NOT_INTERESTED = newInterests;
    saveUserPreferences(INTERESTS, NOT_INTERESTED);
    return NOT_INTERESTED;
}

export function setUserPreferences(interests: string[], notInterests: string[]): void {
    INTERESTS = interests;
    NOT_INTERESTED = notInterests;
    saveUserPreferences(INTERESTS, NOT_INTERESTED);
}

export function loadUserPreferencesFromCache(): void {
    const preferences = loadUserPreferences();
    INTERESTS = preferences.interests;
    NOT_INTERESTED = preferences.notInterests;
}