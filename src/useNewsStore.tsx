import { useEffect } from "react";
import { create } from 'zustand';
import { Article } from './ArticleCard';

type Progress = {
    current: number;
    total: number;
};

type NewsStore = {
    articles: Article[];
    setArticles: (articles: Article[]) => void;
    progress: Progress | null;
    setProgress: (progress: Progress | null) => void;
};

export const useNewsStore = create<NewsStore>((set) => ({
    articles: [],
    setArticles: (articles) => set({ articles, progress: null }),
    progress: null,
    setProgress: (progress) => set({ progress }),
}));

export function useIpcNewsListener() {
    const { setArticles, setProgress } = useNewsStore();

    useEffect(() => {
        const handleNewsUpdate = (_: any, articles: Article[]) => {
            setArticles(articles);
        };

        const handleNewsProgress = (_: any, progress: Progress) => {
            setProgress(progress);
        };

        window.ipcRenderer?.on('news:update', handleNewsUpdate);
        window.ipcRenderer?.on('news:progress', handleNewsProgress);

        return () => {
            window.ipcRenderer?.removeAllListeners('news:update');
            window.ipcRenderer?.removeAllListeners('news:progress');
        };
    }, [setArticles, setProgress]);
}