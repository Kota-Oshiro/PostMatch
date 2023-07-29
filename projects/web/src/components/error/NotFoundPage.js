import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ReactComponent as ErrorImg } from '../../icons/football_coat.svg';

import './Error.css';

function NotFoundPage() {

  return (
    <>
      <Helmet>
        <title>Page Not Found - ポストマッチ</title>
      </Helmet>

      <div className='error-container'>
        <h1 className='error-title'>4-0-4</h1>
        <ErrorImg className='error-image'/>
        <h2 className='error-title-sub'>Page Not Found</h2>
        <div className='error-block'>
          <p>お探しのページは見つかりませんでした。</p>
          <p>移動もしくは削除された可能性があります。</p>
        </div>
        <Link to='/' className='button'>トップページに戻る</Link>
      </div>
    </>
  );
}

export default NotFoundPage;