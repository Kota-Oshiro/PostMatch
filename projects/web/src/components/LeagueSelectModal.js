import React from 'react';
import { useLocation } from 'react-router-dom';

import TeamSelecter from './TeamSelecter';

import './LeagueSelectModal.css';
import { getCompetitionName, getCompetitionColor, getCompetitionIcon } from './UtilityCompetition';

import { ReactComponent as CloseIcon } from '../icons/close.svg';

function LeagueSelectModal({ handleLeagueClick, handleTeamClick, handleModalClose, handleClearSettingClick, isTeamSelecterVisible, filteredTeams}) {

  let location = useLocation();
  const isUserEdit = location.pathname === ("/user/edit")
  const isSchedule = location.pathname.includes("/schedules")
  const isStanding = location.pathname.includes("/standings")
 
  const basicLeagueInfo = [
    { key: 'eng1', competition_id: 2021 },
    { key: 'jpn1', competition_id: 2119 },
    { key: 'esp1', competition_id: 2014 },
    { key: 'ita1', competition_id: 2019 },
  ];

  if (isSchedule || isStanding) {
    basicLeagueInfo.push({ key: 'ucl', competition_id: 2001 });
  } else {
    basicLeagueInfo.push({ key: 'others', competition_id: 'others' });
  }

  const leagueLists = basicLeagueInfo.map(league => ({
    ...league,
    color: getCompetitionColor(league.competition_id),
    icon: getCompetitionIcon(league.competition_id),
    name: getCompetitionName(league.competition_id)
  }));

  return (
    <div id='league-selecter-modal'>
      <div className='modal-header'>
        <div onClick={ handleModalClose } className='modal-close modal-selecter' >
          <CloseIcon className='modal-close-img'/>
        </div>
        {!isTeamSelecterVisible ? (
          <h2 className='league-selecter-modal-title'>リーグを選ぶ</h2>
        ) : (
          <h2 className='league-selecter-modal-title'>チームを選ぶ</h2>
        )}
      </div>
        <div className={`league-lists-container ${isTeamSelecterVisible ? 'invisible' : ''}`}>
          {leagueLists.map((menu) => {
            const LeagueIcon = menu.icon;
            return (
              <div key={menu.key} className='league-selecter-item' style={{backgroundImage: `linear-gradient(${menu.color}, #f7f7f7 400%)`}} onClick={() => handleLeagueClick(menu)}>
                <LeagueIcon key={menu.key} className='league-selecter-img' />
                <span className='league-selecter-text'>{menu.name}</span>
              </div>
            );
          })}
          {isUserEdit && <div className='league-selecter-item clear-setting' onClick={() => handleClearSettingClick()}>設定をクリア</div>}
        </div>
        {isTeamSelecterVisible && <TeamSelecter teams={filteredTeams} handleTeamClick={handleTeamClick} />}
    </div>
  );
}
  
export default LeagueSelectModal;
