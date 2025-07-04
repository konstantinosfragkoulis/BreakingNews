import ArticleCard from "./ArticleCard"
import { Article } from "../electron/types";

type MainContentProps = {
    articles: Article[];
};

export default function RightSidebar({ articles }: MainContentProps) {
    return (
        <div className="sidebar right-sidebar">
            {articles.map((article, i) => {
                if(article.column === "right") {
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