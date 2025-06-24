import { ArticleVariant } from "../electron/types";

export default function ArticleCard({
    title,
    image,
    summary,
    link,
    column,
    variant
}: {
    title: string;
    image: string;
    summary: string;
    link: string;
    column: string;
    variant?: ArticleVariant;
}) {
    if(column === 'middle') {
        switch(variant) {
            case 'featured':
                return (
                    <div className={`${column} layout-featured`}>
                        <img className="featured-image" src={image} alt="" />
                        <div className="featured-content">
                            <a href={link} target="_blank">
                                <h2 className="featured-title">{title}</h2>
                            </a>
                            <p className="featured-summary">{summary}</p>
                        </div>
                    </div>
                );
            
            case 'compact':
                return (
                    <div className="layout-compact">
                        <a href={link} target="_blank" className="compact-title">
                        <h2>{title}</h2>
                        </a>
                        {image && (
                        <img className="compact-image" src={image} alt="" />
                        )}
                        <p className="compact-summary">{summary}</p>
                    </div>
                );
            
            case 'image-focus':
                return (
                    <div className={`${column} layout-image-focus`}>
                        <div className="image-focus-container">
                            <img className="image-focus-bg" src={image} alt="" />
                            <div className="image-focus-overlay">
                                <a href={link} target="_blank">
                                    <h2 className="image-focus-title">{title}</h2>
                                </a>
                                <p className="image-focus-summary">{summary}</p>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return (
                    <div className={column}>
                        <a href={link} target="_blank"><h2>{title}</h2></a>
                        <img className={column} src={image} alt="" />
                        <p className={column}>{summary}</p>
                    </div>
                );
        }
    }
    return (
        <div className={column}>
            <a href={link} target="_blank"><h2>{title}</h2></a>
            {image && <img className={column} src={image} alt="" />}
            <p className={column}>{summary}</p>
        </div>
    );
};