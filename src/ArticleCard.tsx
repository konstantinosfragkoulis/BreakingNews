export type Article = {
  title: string;
  image: string;
  summary: string;
  link: string;
  variant: string;
  score?: number;
};

export default function ArticleCard({
    title,
    image,
    summary,
    link,
    variant,
}: {
    title: string;
    image: string;
    summary: string;
    link: string;
    variant: string;
}) {
    return (
        <div className={variant}>
            <a href={link} target="_blank"><h2>{title}</h2></a>
            <img src={image} alt="" />
            <p>{summary}</p>
        </div>
    );
};