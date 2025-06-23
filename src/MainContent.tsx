import ArticleCard from "./ArticleCard";
import { Article } from "../electron/types";

type MainContentProps = {
    articles: Article[];
};

export default function MainContent({ articles }: MainContentProps) {
    return (
        <div className="main-grid">
            {articles.map((article, i) => {
                if(article.column === "middle") {
                    return(
                        <ArticleCard
                            key={i}
                            title={article.title}
                            image={article.image}
                            summary={article.summary}
                            link={article.link}
                            column={article.column}
                            variant={article.variant}
                        />
                    );
                }
            })}
        </div>
    );
}