import React from 'react';
import MatchCard from './MatchCard';
import './MatchCardList.css';

function MatchCardList({ data }) {

  return (
    <div className='matchcards-container'>
      {data.map((match, index) => (
        <MatchCard 
          key={match.id} 
          match={match}
          className={index === data.length - 1 ? 'last-match-card' : ''}
        />
      ))}
    </div>
  );
}

export default MatchCardList;