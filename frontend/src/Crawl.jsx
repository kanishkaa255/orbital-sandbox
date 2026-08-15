import {useEffect} from 'react';

function Crawl({ text, onFinished }) {
    const lines = text.split(/(?<=[.!?])\s+/);
  return (
    <div className="crawl-container">
        <div className="crawl-text">
            {lines.map((line, i) => (
                <p
                    key = {i}
                    className = "crawl-line"
                    style={{ animationDelay: `${i * 1.5}s` }}
                    onAnimationEnd={i === lines.length - 1 ? onFinished : undefined}
                >
                    {line}
                </p>
            ))}
        </div>
    </div>
  );
}

export default Crawl;