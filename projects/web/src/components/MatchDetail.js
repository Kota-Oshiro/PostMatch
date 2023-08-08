import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import './MatchDetail.css';

import { ReactComponent as NaitonEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as CalenderIcon } from '../icons/calender.svg';

function MatchDetail({ match }) {

  return (
    <>
      <div className='match'>
        <div className='match-top'>
          <div className='match-content'>
            <NaitonEngIcon className='match-icon' />
            <Link to='/schedule/2021/1564' className='match-text-league'>プレミアリーグ</Link>
          </div>
          <span className='match-text'>マッチデイ { match.matchday }</span>
        </div>
        <div className='match-middle'>
          <div className='match-content-middle'>
            <Link to={`/team/${match.home_team.id}`} className='match-crest'>
              <img
                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
                alt={match.home_team.tla}
                className='match-crest-img'
              />
            </Link>
            <span className='match-text'>{ match.home_team.tla }</span>
          </div>
          <div className='match-content-middle'>
            {renderMatchStatus(match)}
          </div>
          <div className='match-content-middle'>
            <Link to={`/team/${match.away_team.id}`} className='match-crest'>
             <img
                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
                alt={match.away_team.tla}
                className='match-crest-img'
              />
            </Link>
            <span className='match-text'>{ match.away_team.tla }</span>
          </div>
        </div>
        <div className='match-bottom'>
          <div className='match-content'>
            <CalenderIcon className='match-icon' />
            {renderMatchStatusBottom(match)}
          </div>
        </div>
      </div>
  </>
  );
}

// 試合スコアの定義
function renderMatchStatus(match) {
  if (match.status === 'FINISHED') {
    return (
      <div className='match-content-middle'>
        <span className='match-score-text'>{match.home_score} - {match.away_score}</span>
        <span className='match-status'>試合終了</span>
      </div>
    );
  } else if (match.status === 'LIVE' || match.status === 'IN_PLAY') {
    return (
      <div className='match-content-middle'>
        <span className='match-score-text'>{match.home_score} - {match.away_score}</span>
        <span className='match-status'>試合中</span>
      </div>
    );
  } else if (match.status === 'TIMED') {
    return (
      <div className='match-content-middle'>
        <span className='match-score-text'>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>
      </div>
    );
  } else {
    return (
      <div className='match-content-middle'>
        <span className='match-score-text'>-- : --</span>
      </div>
    );
  }
}

// 試合日程表示の定義
function renderMatchStatusBottom(match) {
  if (['FINISHED', 'LIVE', 'IN_PLAY', 'TIMED'].includes(match.status)) {
    return (
        <span className='match-text'>{formatUsing(match.started_at, formats.DATE_TIME)}</span>
    );
  } else if (match.status === 'SCHEDULED') {
    return (
        <span className='match-text'>{formatUsing(match.started_at, formats.DATE)} --:--</span>
    );
  }
  else if (match.status === 'POSTPONED') {
    return (
        <span className='match-text'>延期 日時未定</span>
    );
  }
  else {
    return (
        <span className='match-text'>日時未定</span>
    );
  }
}

export default MatchDetail;