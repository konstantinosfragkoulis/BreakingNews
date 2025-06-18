import ArticleCard from "./ArticleCard";
import { Article } from "./ArticleCard";

type MainContentProps = {
    articles: Article[];
};

export default function MainContent({ articles }: MainContentProps) {
    console.log("\n\n\n\n\n\n\n\n\n\\n\n\n\n\n\n\nMainContent rendered with articles:\n\n\n\n\n\n\n\n\n\n", articles);
    return (
        <div className="main-grid">
            {articles.map((article, i) => {
                if(article.variant === "middle") {
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