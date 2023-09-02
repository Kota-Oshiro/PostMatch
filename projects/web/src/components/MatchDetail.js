import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

import './MatchDetail.css';

import { ReactComponent as BallIcon } from '../icons/soccer_ball.svg';
import { ReactComponent as CalenderIcon } from '../icons/calender_grey.svg';
import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';
import { ReactComponent as EarthIcon } from '../icons/earth.svg';

function MatchDetail({ match, goals }) {

  const competitionName = match.competition_id === 2021 ? 'プレミアリーグ' 
    : match.competition_id === 2014 ? 'ラ・リーガ' 
    : match.competition_id === 2019 ? 'セリエA'
    : match.competition_id === 10000001 ? '国際親善試合'
    : match.competition_id === 10000002 ? 'キリンチャレンジカップ'
    : '';
  
  const competitionType = (match.competition_id === 10000001 || match.competition_id === 10000002) ? 'エキシビション' 
  : 'マッチデイ ';

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
    <>
      <div className='match-header' style={{backgroundColor: CompetitionColor}}>
        <CompetitionIcon className='match-icon' />
        <h2 className='match-text-header'>{ competitionName }</h2>
      </div>
      <div className='match-content'>
        <span className='match-text'>{ competitionType }{match.matchday}</span>
        <div className='match-scoreboard'>
          <Link to={`/team/${match.home_team.id}`} className='match-crest-home'>
            <img
              src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
              alt={match.home_team.tla}
              className='match-crest-img'
            />
          </Link>
          <Link to={`/team/${match.away_team.id}`} className='match-crest-away'>
              <img
                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
                alt={match.away_team.tla}
                className='match-crest-img'
              />
          </Link>
          <span className='match-team-home' style={{background: `linear-gradient( -90deg, ${match.home_team.club_color_code_first}, 90%, white)`}}>
            { match.home_team.tla }
          </span>
          {renderMatchScore(match)}
          <span className='match-team-away' style={{background: `linear-gradient( 90deg, ${match.away_team.club_color_code_first}, 90%, white)`}}>
            { match.away_team.tla }
          </span>
        </div>
        {renderMatchStatus(match)}
        {renderGoals(match, goals)}

      </div>
      <div className='match-bottom'>
          <CalenderIcon className='match-icon' />
          {renderMatchStatusBottom(match)}
      </div>
  </>
  );
}

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

// 試合スコアの定義
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