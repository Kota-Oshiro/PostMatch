import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';
import './StandingCard.css';

import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as WatchedIconGrey } from '../icons/watched_grey.svg';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

function StandingCard({ data, isLast, isSingle, isFirst, isSecond, isThird, isBottom }) {
    
    const classNames = ['standing-card'];
    const classNamesBar = ['standing-bar'];

        if (isLast) classNames.push('last-standing-card');
        if (isSingle) classNames.push('single-standing-card');
        if (isFirst) classNamesBar.push('first-position');
        if (isSecond) classNamesBar.push('second-position');
        if (isThird) classNamesBar.push('third-position');
        if (isBottom) classNamesBar.push('bottom-position');

        // 次の相手がいないとき用のスタイル指定
        if (data.next_opponent_team === null) {
            classNames.push('no-oppenent-stading-card');
        }

    const competitionId = data.competition_id

    return (
        <>
        {data && (
            <Link to={`/team/${data.team.id}`}>
            <div className={classNames.join(' ')}>
                {(isFirst || isSecond || isThird || isBottom) &&
                    <span className={classNamesBar.join(' ')}></span>
                }
                <div className='standing-card-block'>
                    <span className='standing-text standing-text-bold'>{data.position}</span>
                    {competitionId !== 2119 ? (                
                        <img
                        src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${data.team.crest_name}.webp`}
                        alt={data.team.tla}
                        className='standing-crest'
                        />
                    ) : (
                        <div className='standing-tmp-crest'>
                            <TmpCrest color={data.team.club_color_code_first}/>
                            <span className='standing-tmp-crest-tla'>{data.team.tla}</span>
                        </div>
                    )}
                    {competitionId !== 2119 && (
                        <span className='standing-tla'>{data.team.tla}</span>
                    )}
                    <span className='standing-name'>{data.team.name_ja}</span>
                </div>
                <div className='standing-card-block'>
                    <span className='standing-text'>{data.played_matches}</span>
                    <span className='standing-text standing-text-bold'>{data.points}</span>
                    <span className='standing-text'>{data.won}</span>
                    <span className='standing-text'>{data.draw}</span>
                    <span className='standing-text'>{data.lost}</span>
                    <span className='standing-text'>{data.goals_for}</span>
                    <span className='standing-text'>{data.goals_against}</span>
                    <span className='standing-text'>{data.goal_difference > 0 ? `+${data.goal_difference}` : data.goal_difference}</span>
                    {data.next_opponent_team !== null ? (
                        competitionId !== 2119 ? (
                            <img
                                src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${data.next_opponent_team.crest_name}.webp`}
                                alt={data.next_opponent_team.tla}
                                className='standing-crest-next'
                            />
                        ) : (
                            <div className='standing-tmp-crest-next'>
                                <TmpCrest color={data.next_opponent_team.club_color_code_first}/>
                                <span className='schedule-tla'>{data.next_opponent_team.tla}</span>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
            </Link>
        )}
        </>
    );
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

export default StandingCard;

