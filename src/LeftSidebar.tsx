import ArticleCard from "./ArticleCard"
import { Article } from "../electron/types";

type MainContentProps = {
    articles: Article[];
};

export default function LeftSidebar({ articles }: MainContentProps) {
    return (
        <div className="sidebar left-sidebar">
            {articles.map((article, i) => {
                if(article.column === "left") {
                    return(
                        <ArticleCard
                            key={i}
                            title={article.title}
                            image={article.image}
                            summary={article.summary}
                            link={article.link}
                            column={article.column}
                        />
                    );
                }
            })}
        </div>
    );
}