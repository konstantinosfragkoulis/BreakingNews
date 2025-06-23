export type Article = {
  title: string;
  image: string;
  summary: string;
  link: string;
  column: string;
  score: number;
};

export default function ArticleCard({
    title,
    image,
    summary,
    link,
    column,
}: {
    title: string;
    image: string;
    summary: string;
    link: string;
    column: string;
}) {
    return (
        <div className={column}>
            <a href={link} target="_blank"><h2>{title}</h2></a>
            <img className={column} src={image} alt="" />
            <p className={column}>{summary}</p>
        </div>
    );
};