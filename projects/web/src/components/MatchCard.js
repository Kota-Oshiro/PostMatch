import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import './MatchCard.css';

function MatchCard({ match }) {

  return (
    <div className='pickup-content'>
      <Link to={`/match/${match.id}`}>    
      <div className='pickup'>
        <div className='pickup-top'>
          <div className='pickup-top-content'>
            <img src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Icon/ENG.webp' className='pickup-icon' />
            <span className='pickup-text'>プレミアリーグ</span>
          </div>
          <span className='pickup-text'>マッチデイ { match.matchday }  </span>
        </div>
        <div className='pickup-middle'>
          <div className='pickup-middle-content'>
            <img
              src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
              className='pickup-crest'
              alt={match.home_team.tla}
            />
            <span className='pickup-text'>{ match.home_team.tla }</span>
          </div>
          <div className='pickup-middle-content'>
            {renderMatchCardStatus(match)}
          </div>
          <div className='pickup-middle-content'>
            <img
              src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
              className='pickup-crest'
              alt={match.away_team.tla}
            />
            <span className='pickup-text'>{ match.away_team.tla }</span>
          </div>
        </div>
      </div>
      </Link>
    </div>
  );
}

// 試合スコアの定義
function renderMatchCardStatus(match) {
  switch (match.status) {
    case 'FINISHED':
      return (
        <>
          <span className='pickup-score-text'>{match.home_score} - {match.away_score}</span>
          <span className='pickup-status '>試合終了</span>
        </>
      );
    case 'IN_PLAY':
    case 'PAUSED':
      return (
        <>
          <span className='pickup-score-text'>{match.home_score} - {match.away_score}</span>
          <span className='pickup-status '>試合中</span>
        </>
      );
    case 'TIMED':
      return (
        <>
          <span className='pickup-score-text'>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>
          <span className='pickup-status '>{formatUsing(match.started_at, formats.MONTH_DAY)}</span>
        </>
      );
    case 'SCHEDULED':
      return (
        <>
          <span className='pickup-score-text'>-- : --</span>
          <span className='pickup-status '>{formatUsing(match.started_at, formats.MONTH_DAY)}</span>
        </>
      );
    default:
      return (
        <span className='pickup-score-text'>-- : --</span>
      );
  }
}

export default MatchCard;