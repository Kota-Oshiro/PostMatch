import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import newsArticle from './NewsArticle';

function NewsArticleList() {

  const sortedNewsArticle = newsArticle.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    return dateB - dateA;
  });

  return (
    <>
      <Helmet>
        <title>運営ブログ - ポストマッチ</title>
        <meta property="og:title" content= '運営ブログ - ポストマッチ' />
      </Helmet>

      <div className='bg'></div>
      <div className='container add-padding'>
        <h1>運営ブログ</h1>
        {sortedNewsArticle.map((article, index) => (
          <Link to={article.path} key={index} className='article-card'>
            <div className='article-card-left'>
              <h2 className='article-card-title'>{article.title}</h2>
              <p className='article-card-date'>{article.date}</p>
            </div>
            <img src={article.ogpImage} className='article-card-img'/>
          </Link>
        ))}
      </div>
    </>
  );
}

export default NewsArticleList;
