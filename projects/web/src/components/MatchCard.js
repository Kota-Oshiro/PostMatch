import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import './MatchCard.css';
import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';
import { ReactComponent as VersusEngIcon } from '../icons/versus.svg';

function MatchCard({ match, className }) {

  const competitionName = match.competition_id === 2021 ? 'プレミアリーグ' 
    : match.competition_id === 2014 ? 'ラ・リーガ' 
    : match.competition_id === 2019 ? 'セリエA'
    : '';
  const CompetitionIcon = match.competition_id === 2021 ? NationEngIcon
    : match.competition_id === 2014 ? NationEspIcon 
    : match.competition_id === 2019 ? NationItaIcon
    : NationEngIcon;

  return (
    <Link to={`/match/${match.id}`}>    
      <div className={`match-card ${className}`}>
        <div className='match-card-top'>
          <div className='match-card-top-league'>
            <CompetitionIcon className='match-card-icon' />
            <span className='match-card-text'>{ competitionName }</span>
          </div>
          <span className='match-card-text'>マッチデイ { match.matchday }  </span>
        </div>
        <div className='match-card-middle'>
          <img
            src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
            className='match-card-crest'
            alt={match.home_team.tla}
          />
          <VersusEngIcon className='match-card-versus-icon'/>
          <img
            src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
            className='match-card-crest'
            alt={match.away_team.tla}
          />
        </div>
        <div className='match-card-bottom'>
          <span className='match-card-tla'>{ match.home_team.tla }</span>
          {renderMatchCardStatus(match)}
          <span className='match-card-tla'>{ match.away_team.tla }</span>
        </div>
      </div>
    </Link>
  );
}

// 試合スコアの定義
function renderMatchCardStatus(match) {
  switch (match.status) {
    case 'FINISHED':
      return (
        <>
          <span className='match-card-status '>試合終了</span>
        </>
      );
    case 'IN_PLAY':
    case 'PAUSED':
      return (
        <>
          <span className='match-card-status '>試合中</span>
        </>
      );
    case 'TIMED':
      return (
        <>
          <span className='match-card-status '>{formatUsing(match.started_at, formats.MONTH_DAY)}</span>
        </>
      );
    case 'SCHEDULED':
      return (
        <>
          <span className='match-card-status '>{formatUsing(match.started_at, formats.MONTH_DAY)}</span>
        </>
      );
    default:
      return (
        <span className='match-card-score-text'>-- : --</span>
      );
  }
}

export default MatchCard;