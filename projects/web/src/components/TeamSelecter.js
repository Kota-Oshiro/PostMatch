import React from 'react';

import './TeamSelecter.css';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

function TeamSelecter({ teams, handleTeamClick }) {
  return (
    <div className='team-selecter-container'>
      {teams.map(team => (
        <div
          key={team.id}
          className='team-selecter-item'
          onClick={() => handleTeamClick({
            id: team.id, 
            competition_id: team.competition_id, 
            tla: team.tla, 
            name: team.name_ja
          })}
        >
          {team.competition_id !== 2119 ? (
            <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${team.tla}.webp`} className='team-selecter-img'/>
          ) : (
            <CrestIcon className='team-selecter-img' />
          )}
          <span className='team-selecter-text'>{team.name_ja}</span>
        </div>
      ))}
    </div>
  );
}

export default TeamSelecter;