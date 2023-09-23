import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';
import './ScheduleCard.css';

import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as WatchedIconGrey } from '../icons/watched_grey.svg';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

function ScheduleCard({ match, isScoreVisible, isFirst, isLast, isSingle }) {

    const location = useLocation();
    const renderMatchScore = location.pathname.includes("/schedule") 
        ? renderMatchScoreForSchedule 
        : renderMatchScoreForWatch;

    const classNames = ['schedule'];
        if (isFirst) classNames.push('first-schedule-card');
        if (isLast) classNames.push('last-schedule-card');
        if (isSingle) classNames.push('single-schedule-card');

    const competitionId = match.competition_id

    return (
        <>
        {match.home_team ? (
            <Link to={`/match/${match.id}`} className='match-links'>
            <div className={classNames.join(' ')}>
            <div className='schedule-block'>
                <div className='schedule-left'>
                    {competitionId !== 2119 ? (                
                        <img
                        src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${match.home_team.crest_name}.webp`}
                        alt={match.home_team.tla}
                        className='schedule-crest'
                        />
                    ) : (
                        <div className='schedule-tmp-crest'>
                            <TmpCrest color={match.home_team.club_color_code_first}/>
                            <span className='schedule-tla'>{match.home_team.tla}</span>
                        </div>
                    )}
                    {renderMatchScore(match, isScoreVisible, competitionId)}
                    {competitionId !== 2119 ? (                
                        <img
                        src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${match.away_team.crest_name}.webp`}
                        alt={match.away_team.tla}
                        className='schedule-crest'
                        />
                    ) : (
                        <div className='schedule-tmp-crest'>
                            <TmpCrest color={match.away_team.club_color_code_first} />
                            <span className='schedule-tla'>{match.away_team.tla}</span>
                        </div>
                    )}
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
        ) : (
            <div className={classNames.join(' ')}>
                <div className='schedule-block'>
                    <div className='schedule-left'>                   
                        <CrestIcon className='schedule-crest'/>
                        {renderMatchScore(match, isScoreVisible, competitionId)}
                        <CrestIcon className='schedule-crest'/>
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
        )}
        </>
    );
}

//スコア表示
function renderMatchScoreForSchedule(match, isScoreVisible, competitionId) {
    const isRecent = isWithin7Days(match.started_at);
    const { status, home_score, away_score } = match;
    const baseClasses = ['schedule-text'];
    
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
    if (['FINISHED', 'PAUSED', 'IN_PLAY', 'TIMED', 'SCHEDULED'].includes(match.status)) {
      return (
          <span className='schedule-date'>{formatUsing(match.started_at, formats.DATE)}</span>
      );
    } else if (match.status === 'POSTPONED') {
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

function TmpCrest({ color}) {

    const gradientId = `paint${Math.random().toString(36).substring(2, 15)}_linear`;

    return (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className='schedule-tmp-crest'>
        <g opacity="1">
        <path d="M28.1482 0.96722C29.3084 0.361246 30.6917 0.361266 31.8519 0.967273L44.7104 7.68363L54.3423 5.03751C55.6154 4.68775 56.8721 5.64576 56.8721 6.96605V7.87031V10.4798V17.0719V34.7402C56.8712 37.0863 56.233 39.3336 55.2285 41.4142C54.2208 43.4968 52.8446 45.4334 51.2648 47.2274C48.1011 50.811 44.1185 53.8445 40.3701 56.0793C37.8635 57.5667 35.4786 58.6942 33.4044 59.3638C32.2078 59.7417 31.1329 59.9914 30.0002 59.9999C29.2528 59.9978 28.5423 59.8812 27.7938 59.7039C27.0486 59.5234 26.2718 59.2736 25.4551 58.9618C23.824 58.3393 22.0311 57.4703 20.1657 56.3932C16.4393 54.2361 12.4327 51.2644 9.19228 47.7364C7.03731 45.3798 5.21071 42.7725 4.12017 39.9006C3.50083 38.261 3.12817 36.5258 3.12817 34.7403V7.86844V6.96645C3.12817 5.64604 4.38509 4.68801 5.65828 5.03798L15.2867 7.68469L28.1482 0.96722Z" fill={`url(#${gradientId})`}/>
        </g>
        <defs>
        <linearGradient id={gradientId} x1="30.0001" y1="0" x2="30.0001" y2="59.9999" gradientUnits="userSpaceOnUse">
        <stop stop-color={color} stop-opacity="1"/>
        <stop offset="1" stop-color={color} stop-opacity="0.6"/>
        </linearGradient>
        </defs>
        </svg>
    );
}

export default ScheduleCard;

