import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Inquiryform, SuggestionBox } from './GoogleForm';
import './Header.css';

import LoginForm from './LoginForm';

import { ReactComponent as Logo } from '../logos/logo.svg';
import { ReactComponent as HomeIcon } from '../icons/home.svg';
import { ReactComponent as HomeIconIndex } from '../icons/home_white.svg';
import { ReactComponent as HomeIconActive } from '../icons/home_white_active.svg';
import { ReactComponent as ScheduleIcon } from '../icons/schedule.svg';
import { ReactComponent as ScheduleIconIndex } from '../icons/schedule_white.svg';
import { ReactComponent as ScheduleIconActive } from '../icons/schedule_active.svg';
import { ReactComponent as PostIcon } from '../icons/post.svg';
import { ReactComponent as PostIconIndex } from '../icons/post_white.svg';
import { ReactComponent as PostIconActive } from '../icons/post_active.svg';
import { ReactComponent as TeamIcon } from '../icons/team.svg';
import { ReactComponent as TeamIconIndex } from '../icons/team_white.svg';
import { ReactComponent as TeamIconActive } from '../icons/team_active.svg';
import { ReactComponent as BackIcon } from '../icons/arrow_left.svg';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

function Header() {
  
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);

  const location = useLocation();
  const navigation = useNavigate();

  const [scrollDepth, setScrollDepth] = useState(0);

  const isIndex = location.pathname === '/';
  const isFold = scrollDepth > 70;

  const classMapping = {
    addClass: `${isIndex ? '-index' : ''}${isIndex && isFold ? ' fold' : ''}`
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollDepth(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBackClick = () => {
    navigation(-1);
  };

  const menus = [
    { key: 'home', link: '/', icon: HomeIcon, activeIcon: HomeIconActive, indexIcon:HomeIconIndex, text: 'トップ' },
    { key: 'schedule', link: '/schedule/2021/1564', icon: ScheduleIcon, activeIcon: ScheduleIconActive, indexIcon:ScheduleIconIndex, text: 'スケジュール' },
    { key: 'post', link: '/posts', icon: PostIcon, activeIcon: PostIconActive, indexIcon:PostIconIndex, text: 'ポスト' },
    { key: 'team', link: '/team/2021/1564', icon: TeamIcon, activeIcon: TeamIconActive, indexIcon:TeamIconIndex, text: 'チーム' }
  ]

  const currentMenu = menus.find(menu => menu.link === location.pathname);

  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isNavModalVisible, setNavModalVisible] = useState(false);
  const [IsModalBackgroundOpen, setModalBackgroundOpen] = useState(false);

  const handleLoginModal = (e) => {
    e.stopPropagation();
    setLoginModalVisible(true);
  };

  const handleNavUserIconClick = (e) => {
    e.stopPropagation();
    setNavModalVisible(true);
  }

  const handleNavMenuCloseClick = () => {
    setNavModalVisible(false);
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      setNavModalVisible((currentIsVisible) => {
        if (currentIsVisible && !document.getElementById('nav-modal').contains(event.target)) {
          return false;
        }
        return currentIsVisible;
      });
    };
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  //モーダル表示時のスクロール制御
  useEffect(() => {
    if (isNavModalVisible) {
      // モーダルが開いているときにスクロールを無効化
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // モーダルが閉じているときにスクロールを有効化
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }, [isNavModalVisible]);
  
  // ログアウト
  const handleLogoutClick = async () => {
    await logout();
    setNavModalVisible(false);
    setModalBackgroundOpen(false);
    navigation('/');
  };

  return (
    <header>
      <div className={`modal-overlay ${isLoginModalVisible ? '' : 'hidden'}`}></div>
      {isLoginModalVisible &&
      <LoginForm
        isLoginModalVisible={isLoginModalVisible}
        setLoginModalVisible={setLoginModalVisible}
      />
      }

      <div className={`header${classMapping.addClass}`}>
        <div className='nav-left'>
          
          {isIndex && isFold &&
            <Logo className='nav-left-logo' />
          }         

          {!currentMenu ? 
            <div className='nav-left-back' onClick={handleBackClick}>
              <BackIcon className='nav-left-back-icon' />
            </div>
            : currentMenu.key === 'home' ?
              null
              :
              <h2 className='nav-left-title'>{currentMenu.text}</h2>
          }

          {menus.map((menu) => {
            const isActive = location.pathname === menu.link;
            const navLeftMenuClass = `nav-left-menu${isIndex ? '-index' : ''}`;
            const navLeftTextClass = `nav-left-text${isIndex ? '-index' : ''} ${isActive ? 'active' : ''}`;

            let Icon;
            if (isActive) {
              Icon = menu.activeIcon;
            } else if (isIndex) {
              Icon = menu.indexIcon;
            } else {
              Icon = menu.icon;
            }

            return (
              <Link key={menu.key} to={menu.link} className={navLeftMenuClass}>
                <Icon className='nav-left-icon' />
                <span className={navLeftTextClass}>{menu.text}</span>
              </Link>
            );
          })}
        </div>
        <div className='nav-right'>
          {isNavModalVisible && 
          
            <div id='nav-modal'>
            
            <div onClick={handleNavMenuCloseClick} className='nav-modal-close'>
              <CloseIcon className='modal-close-img' />
            </div>

            <div className='menu-block'>
              <Link onClick={handleNavMenuCloseClick} className= 'menu-item' to={`/user/${currentUser.id}`}>マイページ</Link>
            </div>

            <div className='menu-block'>
              <SuggestionBox currentUser={currentUser ? currentUser.id : null} className='menu-item' />
              <Inquiryform currentUser={currentUser ? currentUser.id : null} className='menu-item' />
            </div>
            <div className='menu-block'>
              <Link onClick={handleNavMenuCloseClick} className= 'menu-item' to='#'>使い方</Link>
              <Link onClick={handleNavMenuCloseClick} className= 'menu-item' to='#'>運営ブログ</Link>
            </div>
            {isAuthenticated &&
            <div className='menu-block'>
              <Link onClick={handleLogoutClick} className= 'menu-item'>ログアウト</Link>
            </div>
            }
            </div>
          }

          {isAuthenticated ? (
          <img 
            onClick={isNavModalVisible ? handleNavMenuCloseClick : handleNavUserIconClick} 
            className='nav-user-icon' 
            src={currentUser.profile_image}
          />
          ):(
          <div className={`nav-login${classMapping.addClass}`} onClick={handleLoginModal} >ログイン</div>
          )}
        </div>
      </div>
      {!isIndex && <div className='header-bg-block'></div>}  
    </header>
  );
}

export default Header;