import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import LeagueSelectModal from './LeagueSelectModal';

import './LeagueSelecter.css';

import { ReactComponent as ArrowDownIcon } from '../icons/arrow_down_white.svg';
import { ReactComponent as ArrowUpIcon } from '../icons/arrow_up_white.svg';

function LeagueSelecter ({
    isLeagueSelectModalVisible, setLeagueSelectModalVisible,
    setCompetitionId,
    competitionIcon, setCompetitionIcon,
    competitionName, setCompetitionName,
    setCompetitionColor
  }) {

  let location = useLocation();
  const isSchedule = location.pathname.includes("/schedule") 

  const handleLeagueSelectModal = (e) => {
    e.stopPropagation();
    setLeagueSelectModalVisible(true);
  };

  const handleModalClose = () => {
    setLeagueSelectModalVisible(false);
  };

  //モーダル表示時のスクロール制御
  useEffect(() => {
    if (isLeagueSelectModalVisible) {
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
  }, [isLeagueSelectModalVisible]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      setLeagueSelectModalVisible((currentIsVisible) => {
        if (currentIsVisible && !document.getElementById('league-selecter-modal').contains(event.target)) {
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

  const handleLeagueClick = (menu) => {
    setLeagueSelectModalVisible(false);
    setCompetitionId(menu.competition_id);
    setCompetitionIcon(menu.icon);
    setCompetitionName(menu.name);
    setCompetitionColor(menu.color);
  }
  
  const CompetitionIcon = competitionIcon;

  return (
    <>
      <div className={`modal-overlay ${isLeagueSelectModalVisible ? '' : 'hidden'}`}></div>
      <div className={`league-header ${isSchedule ? 'league-select-schedule' : '' }`}>
        <div>
          {isLeagueSelectModalVisible &&
            <LeagueSelectModal handleLeagueClick={handleLeagueClick} handleModalClose={handleModalClose} />
          }
          <div className='league-name' onClick={handleLeagueSelectModal}>
            <CompetitionIcon className='league-icon' />
            <h2 className='league-text'>{competitionName}</h2>
            {isLeagueSelectModalVisible ? (
              <ArrowUpIcon className='league-selecter' />
            ) : (
              <ArrowDownIcon className='league-selecter' />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
  
export default LeagueSelecter;
