import React from 'react';
import { Link } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';
import './ScheduleCard.css';

import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as WatchedIconGrey } from '../icons/watched_grey.svg';

function ScheduleCard({ match }) {
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
                {getMatchScoreOrTime(match)}
                <img
                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`}
                alt={match.away_team.tla}
                className='schedule-crest'
                />
            </div>
            <div className='schedule-right'>
                <span className='schedule-date'>{formatUsing(match.started_at, formats.DATE_TIME)}</span>
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

function getMatchScoreOrTime(match) {
    if (match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'IN_PLAY') {
        return <span className='schedule-text'>{match.home_score} - {match.away_score}</span>;
    } else if (match.status === 'TIMED') {
        return <span className='schedule-text-timed'>{formatUsing(match.started_at, formats.HOUR_MINUTE)}</span>;
    } else {
        return <span className='schedule-text-timed'>-- : --</span>;
    }
}

export default ScheduleCard;