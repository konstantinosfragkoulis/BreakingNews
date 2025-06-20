import ArticleCard from "./ArticleCard"
import { Article } from "./ArticleCard"

type MainContentProps = {
    articles: Article[];
};

export default function RightSidebar({ articles }: MainContentProps) {
    return (
        <div className="sidebar">
            {articles.map((article, i) => {
                if(article.variant === "right") {
                    return(
                        <ArticleCard
                            key={i}
                            title={article.title}
                            image={article.image}
                            summary={article.summary}
                            link={article.link}
                            variant={article.variant}
                        />
                    );
                }
            })}
        </div>
    );
}