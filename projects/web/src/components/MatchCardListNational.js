import React from 'react';
import { MatchCards } from './MatchCardList';
import './MatchCardList.css';
import { ReactComponent as FireIcon } from '../icons/fire.svg';

function MatchCardListNational({ data }) {
  return (
    <div className='matchcards-container'>
      <div className='matchcards-title'>
        <FireIcon className='matchcards-icon' />
        <h2>代表戦の観戦記録をつけよう</h2>
      </div>
      <div className='matchcards-wrapper national-matchcards-wrapper'>
        <div className='matchcards national-matchcards'>
          {data && <MatchCards data={data} />}
        </div>
      </div>
    </div>
  );
}

export default MatchCardListNational;