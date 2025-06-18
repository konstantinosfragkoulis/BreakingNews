import { useEffect } from "react";
import { create } from 'zustand';
import { Article } from './ArticleCard';

type NewsStore = {
    articles: Article[];
    setArticles: (articles: Article[]) => void;
};

export const useNewsStore = create<NewsStore>((set) => ({
    articles: [],
    setArticles: (articles) => set({ articles }),
}));

export function useIpcNewsListener() {
    const setArticles = useNewsStore((state) => state.setArticles);

    useEffect(() => {
        window.ipcRenderer?.on('news:update', (_: any, articles: any[]) => {
            setArticles(articles);
        });
        return () => {
            window.ipcRenderer?.removeAllListeners('news:update');
        };
    }, [setArticles]);
}