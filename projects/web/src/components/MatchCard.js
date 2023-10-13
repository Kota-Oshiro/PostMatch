import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import { getCompetitionName, getCompetitionType, getCompetitionIcon, getCompetitionColor } from '../Utility';

import './MatchCard.css';

import { ReactComponent as VersusEngIcon } from '../icons/versus_grey.svg';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

function MatchCard({ match, className }) {

  const competitionName = getCompetitionName(match.competition_id);
  const competitionType = getCompetitionType(match.competition_id);
  const CompetitionIcon = getCompetitionIcon(match.competition_id);
  const competitionColor = getCompetitionColor(match.competition_id);

  return (

    <Link to={`/match/${match.id}`}>    
      <div className={`match-card ${className}`}>
      <div className='content-bg' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 204px)`}} >
        <div className='match-card-header'>
          <CompetitionIcon className='match-card-icon' />
          <span className='match-card-text-header'>{ competitionName }</span>
        </div>

        <div className='match-card-content'>
          <span className='match-card-text'>{ competitionType }{ match.matchday }</span>
          <div className='match-card-scoreboard'>
            <MatchCardCrest team={match.home_team} competitionId={match.competition_id} position="home" />
            <MatchCardCrest team={match.away_team} competitionId={match.competition_id} position="away" />

            <MatchCardTeamName team={match.home_team} competitionId={match.competition_id} position="home" />
            <VersusEngIcon className='match-card-versus-icon'/>
            <MatchCardTeamName team={match.away_team} competitionId={match.competition_id} position="away" />
          </div>
          {renderMatchCardStatus(match)}
        </div>
      </div>
      </div>
    </Link>
  );
}

const MatchCardCrest = ({ team, competitionId, position }) => {
  if (!team || competitionId === 2119) {
    return <CrestIcon className={`match-card-crest-${position}`} />;
  }

  return (
    <img
      src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${team.crest_name}.webp`}
      className={`match-card-crest-${position}`}
      alt={team.tla}
    />
  );
};

const MatchCardTeamName = ({ team, competitionId, position }) => {
  const gradientDegree = position === "home" ? "-90deg" : "90deg";
  const background = team 
    ? `linear-gradient( ${gradientDegree}, ${team.club_color_code_first}, 90%, white)`
    : `linear-gradient( ${gradientDegree}, #888888, 90%, white)`;
  
  const classes = `match-card-team-${position} ${(!team || competitionId === 2119) ? 'match-card-tla-japanese' : ''}`;

  return (
    <span className={classes} style={{background: background}}>
      {team ? team.tla : '未定'}
    </span>
  );
};

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
          <span className='match-card-status'>{formatUsing(match.started_at, formats.DATE_TIME)}</span>
        </>
      );
    case 'SCHEDULED':
      return (
        <>
          <span className='match-card-status'>{formatUsing(match.started_at, formats.DATE_TIME)}</span>
        </>
      );
    default:
      return (
        <span className='match-card-status'>-- : --</span>
      );
  }
}

export default MatchCard;