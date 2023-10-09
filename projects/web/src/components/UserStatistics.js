import React from 'react';

import './UserStatistics.css';

import { hexToRgba, getCurrentMonthAndYear, getLastMonthAndYear } from '../Utility';

import { ReactComponent as TrophyIcon } from '../icons/trophy_white.svg';

function UserStastics({data, account}) {

  const { year: currentYear, month: currentMonth } = getCurrentMonthAndYear();
  const { year: lastYear, month: lastMonth } = getLastMonthAndYear();

  // 数値を2桁の文字列に変換する関数
  const toTwoDigitString = (num) => String(num).padStart(2, '0');

  const statisticsMetrics = [
    { key: 'watch', title: '観戦', count: data.match_count_this_month, unit: '試合'},
    { key: 'watch_stadium', title: '現地', count: data.stadium_count_this_month, unit: '試合' },
    { key: 'post', title: 'ポスト', count: data.post_count_this_month, unit: '件' }
  ];

  const statisticsMetricsLastMonth = [
    { key: 'watch', title: '観戦', count: data.match_count_last_month, unit: '試合'},
    { key: 'watch_stadium', title: '現地', count: data.stadium_count_last_month, unit: '試合' },
    { key: 'post', title: 'ポスト', count: data.post_count_last_month, unit: '件' }
  ];

  return (
    <div className='statistics-wrapper'>
      <div className='statistics' style={{
        backgroundImage: account.support_team
          ? `linear-gradient(160deg, ${hexToRgba(account.support_team.club_color_code_first, 0.6)}, ${hexToRgba(account.support_team.club_color_code_first, 1)} 80%)`
          : `linear-gradient(160deg, rgba(52, 101, 255, 0.6), rgba(52, 101, 255, 1) 60%)`
      }}>
        <div className='statistics-title'>
          <h2>今月の観戦記録</h2>
          <span>{currentYear}.{toTwoDigitString(currentMonth)}</span>
        </div>
        <div className='statistics-metrics'>
          {statisticsMetrics.map((metric) => {
            const { key, title, count, unit } = metric;
            return (
              <div key={key} className='statistics-metric'>
                <div className='statistics-metric-title'>
                  <span className='statistics-text'>{title}</span>
                </div>
                <div className='statistics-block'>
                  <span className='statistics-count'>{count}</span>
                  <span className='statistics-unit'>{unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className='statistics-motms'>
          <div className='statistics-metric-title'>
            <TrophyIcon className='statistics-icon'/>
            <span className='statistics-text'>MOM TOP5</span>
          </div>
          {data.top_players_this_month.map((player) => (
            <div key={player.id || player.player__name_ja} className='statistics-motm'>
              <span className="statistics-motm-player">{player.player__id ? player.player__name_ja : 'ー'}</span>
              <span className="statistics-motm-count">{player.player__id ? `${player.count} 回` : 'ー 回'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className='statistics statistics-lastmonth'>
        <div className='statistics-title'>
          <h2>前月の観戦記録</h2>
          <span>{lastYear}.{toTwoDigitString(lastMonth)}</span>
        </div>
        <div className='statistics-metrics'>
          {statisticsMetricsLastMonth.map((metric) => {
            const { key, title, count, unit } = metric;
            return (
              <div key={key} className='statistics-metric'>
                <div className='statistics-metric-title'>
                  <span className='statistics-text'>{title}</span>
                </div>
                <div className='statistics-block'>
                  <span className='statistics-count'>{count}</span>
                  <span className='statistics-unit'>{unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className='statistics-motms'>
          <div className='statistics-metric-title'>
            <TrophyIcon className='statistics-icon'/>
            <span className='statistics-text'>MOM TOP5</span>
          </div>
          {data.top_players_last_month.map((player) => (
            <div key={player.id || player.player__name_ja} className='statistics-motm'>
              <span className="statistics-motm-player">{player.player__id ? player.player__name_ja : 'ー'}</span>
              <span className="statistics-motm-count">{player.player__id ? `${player.count} 回` : 'ー 回'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserStastics;
