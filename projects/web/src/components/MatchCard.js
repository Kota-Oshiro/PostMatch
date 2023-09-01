import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import './MatchCard.css';
import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';
import { ReactComponent as VersusEngIcon } from '../icons/versus_grey.svg';
import { ReactComponent as EarthIcon } from '../icons/earth.svg';

function MatchCard({ match, className }) {

  const competitionName = match.competition_id === 2021 ? 'プレミアリーグ' 
    : match.competition_id === 2014 ? 'ラ・リーガ' 
    : match.competition_id === 2019 ? 'セリエA'
    : match.competition_id === 10000001 ? '国際親善試合'
    : match.competition_id === 10000002 ? 'キリンチャレンジカップ'
    : '';

  const CompetitionIcon = match.competition_id === 2021 ? NationEngIcon
    : match.competition_id === 2014 ? NationEspIcon 
    : match.competition_id === 2019 ? NationItaIcon
    : EarthIcon;

    const CompetitionColor = match.competition_id === 2021 ? '#38003c'
    : match.competition_id === 2014 ? '#FF4B44'
    : match.competition_id === 2019 ? '#171D8D'
    : (match.competition_id === 10000001 || match.competition_id === 10000002) ? '#052667'
    : '#3465FF';

  return (

    <Link to={`/match/${match.id}`}>    
      <div className={`match-card ${className}`}>
        <div className='match-card-header' style={{backgroundColor: CompetitionColor}}>
          <CompetitionIcon className='match-card-icon' />
          <span className='match-card-text-header'>{ competitionName }</span>
        </div>

        <div className='match-card-content'>
          <span className='match-card-text'>マッチデイ {match.matchday}</span>
          <div className='match-card-scoreboard'>
            <img
              src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
              className='match-card-crest-home'
              alt={match.home_team.tla}
            />
            <img
              src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
              className='match-card-crest-away'
              alt={match.away_team.tla}
            />
            <span className='match-card-team-home' style={{background: `linear-gradient( -90deg, ${match.home_team.club_color_code_first}, 90%, white)`}}>
              { match.home_team.tla }
            </span>
            <VersusEngIcon className='match-card-versus-icon'/>
            <span className='match-card-team-away' style={{background: `linear-gradient( 90deg, ${match.away_team.club_color_code_first}, 90%, white)`}}>
              { match.away_team.tla }
            </span>
          </div>
          {renderMatchCardStatus(match)}
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
          <span className='match-card-status'>試合終了</span>
        </>
      );
    case 'IN_PLAY':
      return (
        <>
          <span className='match-card-status'>試合中</span>
        </>
      );
    case 'PAUSED':
      return (
        <>
          <span className='match-card-status'>ハーフタイム</span>
        </>
      );
    case 'TIMED':
      return (
        <>
          <span className='match-card-status'>{formatUsing(match.started_at, formats.MONTH_DAY)}</span>
        </>
      );
    case 'SCHEDULED':
      return (
        <>
          <span className='match-card-status'>{formatUsing(match.started_at, formats.MONTH_DAY)}</span>
        </>
      );
    default:
      return (
        <span className='match-card-status'>-- : --</span>
      );
  }
}

export default MatchCard;