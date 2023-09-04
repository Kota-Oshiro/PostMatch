import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';
import './ScheduleCard.css';

import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as WatchedIconGrey } from '../icons/watched_grey.svg';

function ScheduleCard({ match, isScoreVisible, competitionId }) {

    const location = useLocation();

    const renderMatchScore = location.pathname.includes("/schedule") 
        ? renderMatchScoreForSchedule 
        : renderMatchScoreForWatch;

    return (
        <Link to={`/match/${match.id}`} className='match-links'>
        <div className='schedule'>
        <div className='schedule-block'>
            <div className='schedule-left'>
                {competitionId !== 2119 ? (                
                    <img
                    src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
                    alt={match.home_team.tla}
                    className='schedule-crest'
                    />
                ) : (
                    <span className='schedule-tla' style={{ backgroundColor: match.home_team.club_color_code_first }}>{match.home_team.tla}</span>
                )}
                {renderMatchScore(match, isScoreVisible, competitionId)}
                {competitionId !== 2119 ? (                
                    <img
                    src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
                    alt={match.away_team.tla}
                    className='schedule-crest'
                    />
                ) : (
                    <span className='schedule-tla' style={{ backgroundColor: match.away_team.club_color_code_first }}>{match.away_team.tla}</span>
                )}
            </div>
            <div className='schedule-right'>
                {renderMatchDateTime(match)}
                <div className={`schedule-record ${competitionId === 2119 ? 'schedule-narrow' : ''}`}>
                    <div className='schedule-record-block'>
                        <WatchedIconGrey className='schedule-icon' />
                        <span className='schedule-record-count'>{match.total_watch_count}</span>
                    </div>
                    <div className='schedule-record-block'>
                        <PostIcon className='schedule-icon' />
                        <span className='schedule-record-count'>{match.total_post_count}</span>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </Link>
    );
}

//スコア表示
function renderMatchScoreForSchedule(match, isScoreVisible, competitionId) {
    const isRecent = isWithin7Days(match.started_at);
    const { status, home_score, away_score } = match;
    const baseClasses = ['schedule-text'];
    
    // Jリーグの場合はロゴではなくテキスト表示のためマージン調整を行う用のクラス付与
    if (competitionId === 2119) {
        baseClasses.push('schedule-narrow');
    }

    // TIMEDのときの時間表示
    if (status === 'TIMED') {
        baseClasses.push('schedule-timed');
        return <span className={baseClasses.join(' ')}>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>;
    }
    
    // スコア表示且つ最近 または 最近でない場合はスコア表示
    if ((isScoreVisible && isRecent) || !isRecent) {
        if (['FINISHED', 'PAUSED', 'IN_PLAY'].includes(status)) {
            if (status === 'IN_PLAY' || status === 'PAUSED') {
                baseClasses.push('schedule-inplay');
            }
            return <span className={baseClasses.join(' ')}>{home_score} - {away_score}</span>;
        }
    }

    // スコア非表示（デフォルト）且つ最近の場合はステータスを代入
    if (!isScoreVisible && isRecent) {
        baseClasses.push('schedule-invisible');
        if (status === 'IN_PLAY' || status === 'PAUSED') {
            baseClasses.push('schedule-inplay');
        }
        return <span className={baseClasses.join(' ')}>{statusMapping(status)}</span>;
    }

    return <span className={baseClasses.join(' ')}>-- : --</span>;
}

// ステータス定義
const statusMapping = (status) => {
    switch (status) {
        case 'FINISHED':
            return '終了';
        case 'IN_PLAY':
            return '試合中';
        case 'PAUSED':
            return 'ＨＴ';
        default:
            return '-- : --';
    }
}

// started_atが7日以内か判定する用
function isWithin7Days(dateTimeStr) {
    const now = new Date(); // 現在の日付と時刻を取得
    const matchDate = new Date(dateTimeStr); // 引数の日付文字列をDateオブジェクトに変換
    const difference = now - matchDate; // 両者の差をミリ秒で取得

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1日のミリ秒
    const sevenDaysInMilliseconds = oneDayInMilliseconds * 7; // 7日のミリ秒

    return difference <= sevenDaysInMilliseconds; // 7日以内であるか判定
}

function renderMatchScoreForWatch(match) {
    const { status, home_score, away_score } = match;

    if (status === 'FINISHED' || status === 'PAUSED' || status === 'IN_PLAY') {
        return <span className={`schedule-text ${status === 'IN_PLAY' ? 'schedule-inplay' : ''}`}>{home_score} - {away_score}</span>;
    }

    if (status === 'TIMED') {
        return <span className='schedule-text schedule-timed'>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>;
    }

    return <span className='schedule-text schedule-timed'>-- : --</span>;
}

// 試合日程表示の定義
function renderMatchDateTime(match) {
    if (['FINISHED', 'PAUSED', 'IN_PLAY', 'TIMED'].includes(match.status)) {
      return (
          <span className='schedule-date'>{formatUsing(match.started_at, formats.DATE_TIME)}</span>
      );
    } else if (match.status === 'SCHEDULED') {
      return (
          <span className='schedule-date'>{formatUsing(match.started_at, formats.DATE)}</span>
      );
    }
    else if (match.status === 'POSTPONED') {
      return (
          <span className='schedule-date'>延期 日時未定</span>
      );
    }
    else {
      return (
          <span className='schedule-date'>日時未定</span>
      );
    }
  }

export default ScheduleCard;