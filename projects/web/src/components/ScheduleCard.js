import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';
import './ScheduleCard.css';

import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as WatchedIconGrey } from '../icons/watched_grey.svg';

function ScheduleCard({ match, isScoreVisible }) {

    const location = useLocation();

    const renderMatchScore = location.pathname.includes("/schedule") 
        ? renderMatchScoreForSchedule 
        : renderMatchScoreForWatch;

    return (
        <Link to={`/match/${match.id}`} className='match-links'>
        <div className='schedule'>
        <div className='schedule-block'>
            <div className='schedule-left'>
                <img
                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`}
                alt={match.home_team.tla}
                className='schedule-crest'
                />
                {renderMatchScore(match, isScoreVisible)}
                <img
                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
                alt={match.away_team.tla}
                className='schedule-crest'
                />
            </div>
            <div className='schedule-right'>
                {renderMatchDateTime(match)}
                <div className='schedule-record'>
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

function renderMatchScoreForSchedule(match, isScoreVisible) {
    const isRecent = isWithin7Days(match.started_at);
    const { status, home_score, away_score } = match;

    if ((isScoreVisible && isRecent) || !isRecent) {
        if (status === 'FINISHED' || status === 'PAUSED' || status === 'IN_PLAY') {
            return <span className={`schedule-text ${(status === 'IN_PLAY') || (status === 'PAUSED') ? 'schedule-inplay' : ''}`}>{home_score} - {away_score}</span>;
        }
    }

    if (!isScoreVisible && isRecent) {
        if (status === 'FINISHED') {
            return <span className='schedule-text schedule-invisible'>終了</span>;
        } else if (status === 'IN_PLAY') {
            return <span className='schedule-text schedule-invisible schedule-inplay'>試合中</span>;
        } else if (status === 'PAUSED') {
            return <span className='schedule-text schedule-invisible schedule-inplay'>ＨＴ</span>;
        }
    }

    if (status === 'TIMED') {
        return <span className='schedule-text schedule-timed'>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>;
    }

    return <span className='schedule-text schedule-timed'>-- : --</span>;
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