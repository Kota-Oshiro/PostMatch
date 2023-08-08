import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import newsArticle from './NewsArticle';
import './Article.css';

import { ReactComponent as LogoCircle } from '../../logos/logo_circle.svg';

import NotFoundPage from '../error/NotFoundPage';

function NewsArticle() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { path } = useParams();
  const article = newsArticle.find(newsArticle => newsArticle.path === path);

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Helmet>
        <title>{article.helmetTitle}</title>
        <meta name="description" content= {article.helmetText} />
        <meta property="og:title" content= {article.helmetTitle} />
        <meta property="og:description"content= {article.helmetText} />
        <meta property="og:image" content= {article.ogpImage} />
      </Helmet>

      <div className='bg'></div>
      <div className='article-container'>
        <span className='article-date'>{article.date}</span>
        <h1 className='article-title'>{article.title}</h1>
        <Link to='/user/1' className='article-user'>
          <LogoCircle className='article-user-icon'/>
          <span className='article-user-name'>ポストマッチ</span>
        </Link>
        <img src={article.ogpImage} />
        {article.content.map((section, index) => (
          <section key={index} className='article-section'>
            {section.map((item, itemIndex) => {
              if (item.type === 'subtitle') return <h2 key={itemIndex}>{item.value}</h2>;
              if (item.type === 'image') return <img key={itemIndex} src={item.value} alt="" />;
              if (item.type === 'text') return <p key={itemIndex} className='article-text'>{item.value}</p>;
              if (item.type === 'li') return <ul><li key={itemIndex}>{item.value}</li></ul>;
              if (item.type === 'link') return <a key={itemIndex} href={item.href} className='article-link' target='_blank' rel='noopener noreferrer'>{item.value}</a>;
              return null;
            })}
          </section>
        ))}
      </div>
    </>
  )
}

export default NewsArticle;