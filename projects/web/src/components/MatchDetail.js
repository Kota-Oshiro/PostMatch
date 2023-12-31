import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import { getCompetitionName, getCompetitionType, getCompetitionIcon, getCompetitionColor } from '../Utility';

import './MatchDetail.css';

import { ReactComponent as BallIcon } from '../icons/soccer_ball.svg';
import { ReactComponent as CalenderIcon } from '../icons/calender_grey.svg';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

function MatchDetail({ match, goals }) {

  const competitionName = getCompetitionName(match.competition_id);
  const competitionType = getCompetitionType(match.competition_id);
  const CompetitionIcon = getCompetitionIcon(match.competition_id);
  const CompetitionColor = getCompetitionColor(match.competition_id);

  return (
    <>
      <div className='match-header' style={{backgroundColor: CompetitionColor}}>
          <div className='match-header-wrapper'>
            <CompetitionIcon className='match-icon' />
            <h2 className='match-text-header'>{ competitionName }</h2>
          </div>
      </div>
      <div className='match-content'>
        <span className='match-text'>{ competitionType }{match.matchday}</span>
        <div className='match-scoreboard'>
          <TeamCrestLink team={match.home_team} position="home" competitionId={match.competition_id} />
          <TeamCrestLink team={match.away_team} position="away" competitionId={match.competition_id} />
          
          <TeamNameWithGradient team={match.home_team} competitionId={match.competition_id} position="home" />
          {renderMatchScore(match)}
          <TeamNameWithGradient team={match.away_team} competitionId={match.competition_id} position="away" />
        </div>
        {renderMatchStatus(match)}
        {renderGoals(match, goals)}

      </div>
      <div className='match-bottom'>
        <div className='match-bottom-wrapper'>
          <CalenderIcon className='match-icon' />
          {renderMatchStatusBottom(match)}
        </div>
      </div>
  </>
  );
}

const TeamCrestLink = ({ team, position, competitionId }) => {
  const defaultCrest = (
    <div className={`match-crest-${position}`}>
      <CrestIcon className='match-crest-img' />
    </div>
  );

  if (!team) return defaultCrest;

  return (
    <Link to={`/team/${team.id}`} className={`match-crest-${position}`}>
      {competitionId !== 2119 ? (
        <img
          src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${team.crest_name}.webp`}
          alt={team.tla}
          className='match-crest-img'
        />
      ) : (
        <CrestIcon className='match-crest-img' />
      )}
    </Link>
  );
};

const TeamNameWithGradient = ({ team, competitionId, position }) => {
  const gradientDegree = position === "home" ? "-90deg" : "90deg";
  const background = team 
    ? `linear-gradient( ${gradientDegree}, ${team.club_color_code_first}, 90%, white)`
    : `linear-gradient( ${gradientDegree}, #888888, 90%, white)`;

  return (
    <span 
      className={`match-team-${position} ${(!team || competitionId === 2119) ? 'match-tla-japanese' : ''}`} 
      style={{background: background}}>
      {team ? team.tla : '未定'}
    </span>
  );
};

// 試合スコアの定義
function renderMatchScore(match) {
  if (match.status === 'FINISHED') {
    return (
      <span className='match-result'>{match.home_score} - {match.away_score}</span>
    );
  } else if (match.status === 'PAUSED' || match.status === 'IN_PLAY') {
    return (
      <span className='match-result'>{match.home_score} - {match.away_score}</span>
    );
  } else if (match.status === 'TIMED') {
    return (
      <span className='match-result match-prematch'>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>
    );
  } else {
    return (
      <span className='match-result match-prematch'>-- : --</span>
    );
  }
}

// 試合ステータスの定義
function renderMatchStatus(match) {
  if (match.status === 'FINISHED') {
    return (
      <span className='match-status'>試合終了</span>
    );
  } else if (match.status === 'IN_PLAY') {
    return (
      <span className='match-status'>試合中</span>
    );
  } else if (match.status === 'PAUSED') {
    return (
      <span className='match-status'>ハーフタイム</span>
    );
  }
  else if (match.status === 'TIMED') {
    return (
      <span className='match-status'>開始前</span>
    );
  } else {
    return (
      <span className='match-status'>開始前</span>
    );
  }
}

function renderGoals(match, goals) {

  return (
    <>
      {goals.length > 0 && (
        <div className='match-goals'>
          <div className='match-goals-home'>
            {goals.filter(goal => 
                (match.home_team.id === goal.team && goal.type !== "OWN") ||
                (match.away_team.id === goal.team && goal.type === "OWN")
            ).map(goal => (
              <div key={goal.player.id} className='match-goals-player-home' >
                <span className='match-goals-minute'>
                  {goal.additional_time  ? `${goal.minute} +${goal.additional_time}'` : `${goal.minute}'`}
                </span>
                <span className='match-goals-scorer'>
                  {goal.type === "OWN" ? `${goal.player.name_ja}(OG)` : goal.player.name_ja}
                </span>
                {goal.assist_player && (
                  <span className='match-goals-assist'>({goal.assist_player.name_ja})</span>
                )}
              </div>
            ))}
          </div>
          <div className='match-goals-center'>
            <BallIcon className='match-goals-icon' />
          </div>
          <div className='match-goals-away'>
            {goals.filter(goal => 
                (match.away_team.id === goal.team && goal.type !== "OWN") ||
                (match.home_team.id === goal.team && goal.type === "OWN")
            ).map(goal => (
              <div key={goal.player.id} className='match-goals-player-away' >                
                <span className='match-goals-minute'>
                  {goal.additional_time  ? `${goal.minute} +${goal.additional_time}'` : `${goal.minute}'`}
                </span>
                <span className='match-goals-scorer'>
                  {goal.type === "OWN" ? `(OG)${goal.player.name_ja}` : goal.player.name_ja}
                </span>
                {goal.assist_player && (
                  <span className='match-goals-assist'>({goal.assist_player.name_ja})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// 試合日程表示の定義
function renderMatchStatusBottom(match) {
  if (['FINISHED', 'PAUSED', 'IN_PLAY', 'TIMED'].includes(match.status)) {
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