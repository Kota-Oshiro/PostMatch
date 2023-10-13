import React from 'react';
import { Link } from 'react-router-dom';

import './BannerList.css';
import { ReactComponent as NationUclIcon } from '../icons/nation_ucl.svg';
import { ReactComponent as SakuraIcon } from '../icons/sakura.svg';
import JpnBanner from '../banners/banner_jpn.svg';
import UclBanner from '../banners/banner_ucl.svg';

function BannerList() {
  return (
    <div className='banners-container'>
      <Link to='/schedule/team/japan'>
        <div className='banner-wrapper'>
          <div className='banner'>
            <div className='banner-content'>
              <div className='banner-bg' style={{backgroundImage: `url(${JpnBanner})`}}></div>
              <div className='banner-textarea'>
                <div className='banner-title'>
                  <SakuraIcon className='banner-icon'/>
                  <h2 className=''>サッカー日本代表</h2>
                </div>
                <span className='banner-description'>サムライブルーの観戦記録をつけよう</span>
              </div>
            </div>      
          </div>
        </div>
      </Link>
      <Link to='/schedule/champions-league'>
        <div className='banner-wrapper'>
          <div className='banner'>
            <div className='banner-content'>
              <div className='banner-bg' style={{backgroundImage: `url(${UclBanner})`}}></div>
              <div className='banner-textarea'>
                <div className='banner-title'>
                  <NationUclIcon className='banner-icon'/>
                  <h2 className=''>チャンピオンズリーグ</h2>
                </div>
                <span className='banner-description'>欧州最高峰の大会の観戦記録をつけよう</span>
              </div>
            </div>      
          </div>
        </div>
      </Link>
    </div>
  );
}

export default BannerList;