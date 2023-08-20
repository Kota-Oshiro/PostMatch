import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

import { ReactComponent as HomeIcon } from '../icons/home.svg';
import { ReactComponent as HomeIconActive } from '../icons/home_active.svg';
import { ReactComponent as ScheduleIcon } from '../icons/schedule.svg';
import { ReactComponent as ScheduleIconActive } from '../icons/schedule_active.svg';
import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as PostIconActive } from '../icons/post_active.svg';
import { ReactComponent as TeamIcon } from '../icons/team.svg';
import { ReactComponent as TeamIconActive } from '../icons/team_active.svg';

function BottomNavigation() {
  const location = useLocation();

  const menus = [
    { key: 'home', link: '/', icon: HomeIcon, activeIcon: HomeIconActive, text: 'トップ' },
    { key: 'schedule', link: '/schedules', icon: ScheduleIcon, activeIcon: ScheduleIconActive, text: 'スケジュール' },
    { key: 'post', link: '/posts', icon: PostIcon, activeIcon: PostIconActive, text: 'ポスト' },
    { key: 'team', link: '/teams', icon: TeamIcon, activeIcon: TeamIconActive, text: 'チーム' }
  ]

  return (
    <>
      <div className='bottom-navigation'>
        {menus.map((menu) => {
          const isActive = location.pathname === menu.link;
          return (
            <Link key={menu.key} to={menu.link} className='bottom-navigation-menu'>
              {isActive ? <menu.activeIcon className='bottom-navigation-icon' /> : <menu.icon className='bottom-navigation-icon' />}
              <span className={`bottom-navigation-text ${isActive ? 'active' : ''}`}>
                {menu.text}
              </span>
            </Link>
          );
        })}
      </div>
      <div className='bottom-navigation-bg-block'></div>
    </>
  );
}

export default BottomNavigation;
