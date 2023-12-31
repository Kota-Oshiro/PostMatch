import React from 'react';
import MatchCard from './MatchCard';
import './MatchCardList.css';

export function MatchCards({ data }) {
  return (
    <>
      {data.map((match, i) => (
        <MatchCard  
          key={match.id} 
          match={match}
          className={i === data.length - 1 ? 'last-match-card' : ''}
        />
      ))}
    </>
  );
}

export function TopMatchCardList({ data }) {
  return (
    <div className='matchcards-wrapper'>
      <div className='matchcards'>
        {data && <MatchCards data={data} />}
      </div>
  </div>
  );
}