import React from 'react';
import { Link } from 'react-router-dom';

import './BannerList.css';
import { ReactComponent as NationUclIcon } from '../icons/nation_ucl.svg';

function BannerList() {
  return (
    <Link to='/schedule/champions-league'>
      <div className='banners-container'>
        <div className='banner'>
          <div className='banner-content'>
            <div className='banner-textarea'>
              <div className='banner-title'>
                <NationUclIcon className='banner-icon'/>
                <h2 className=''>チャンピオンズリーグ</h2>
              </div>
              <span className='banner-description'>試合を選んで観戦記録をつけよう</span>
            </div>
            <img className='banner-img' src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/trophy.webp'/>
          </div>      
        </div>
      </div>
    </Link>
  );
}

export default BannerList;