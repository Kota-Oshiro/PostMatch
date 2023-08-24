import React from 'react';
import { useLocation } from 'react-router-dom';

import TeamSelecter from './TeamSelecter';

import './LeagueSelectModal.css';
import { ReactComponent as NaitonEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NaitonEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NaitonItaIcon } from '../icons/nation_ita.svg';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

function LeagueSelectModal({ handleLeagueClick, handleTeamClick, handleModalClose, handleClearSettingClick, isTeamSelecterVisible, filteredTeams}) {

  let location = useLocation();
  const isUserEdit = location.pathname === ("/user/edit") 

  const leagueLists = [
    { key: 'eng1', competition_id: 2021, season_id: '1564', color: '#38003c', icon: NaitonEngIcon, name: 'プレミアリーグ' },
    { key: 'esp1', competition_id: 2014, season_id: '1577', color: '#FF4B44', icon: NaitonEspIcon, name: 'ラ・リーガ' },
    { key: 'ita1', competition_id: 2019, season_id: '1600', color: '#171D8D', icon: NaitonItaIcon, name: 'セリエA' },
  ]

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
            const bgColor = {
              backgroundColor: menu.color
            };
            return (
              <div key={menu.key} className='league-selecter-item' style={bgColor} onClick={() => handleLeagueClick(menu)}>
                <LeagueIcon key={menu.key} className='league-selecter-img' />
                <span className='league-selecter-text'>{menu.name}</span>
              </div>
            );
          })}
          {isUserEdit && <div className='league-selecter-item clear-setting'  onClick={() => handleClearSettingClick()}>設定をクリア</div>}
        </div>
        {isTeamSelecterVisible && <TeamSelecter teams={filteredTeams} handleTeamClick={handleTeamClick} />}
    </div>
  );
}
  
export default LeagueSelectModal;
