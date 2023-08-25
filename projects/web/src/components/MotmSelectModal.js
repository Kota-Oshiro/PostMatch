import React from 'react';

import './MotmSelectModal.css';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

function LeagueSelectModal({ match, postPlayerList, handlePlayerClick, handleModalClose }) {

  return (
    <div id='motm-select-modal'>
      <label className='player-lists-group' style={{ backgroundColor: match.home_team.club_color_code_first }}>
        <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.home_team.tla}.webp`} className='edit-support-crest'/>
        {match.home_team.name_ja}
      </label>
      {postPlayerList.home_team_players.map(player => (
        <div key={player.id} data-playerid={player.id} data-playername={player.name_ja} className='player-lists-player' onClick={(e) => handlePlayerClick(player.id, player.name_ja, e)} >
          <span className='player-lists-player-number' style={{ color: match.home_team.club_color_code_first }}>{player.shirt_number}</span>
          <span>{player.name_ja }</span>
        </div>
      ))}
      <label className='player-lists-group' style={{ backgroundColor: match.away_team.club_color_code_first }}>
        <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${match.away_team.tla}.webp`} className='edit-support-crest'/>
        {match.away_team.name_ja}
      </label>
      {postPlayerList.away_team_players.map(player => (
        <div key={player.id} data-playerid={player.id} data-playername={player.name_ja} className='player-lists-player' onClick={(e) => handlePlayerClick(player.id, player.name_ja, e)} >
          <span className='player-lists-player-number' style={{ color: match.away_team.club_color_code_first }}>{player.shirt_number}</span>
          <span>{player.name_ja}</span>
        </div>      
      ))}
    </div>
  );
}
  
export default LeagueSelectModal;
