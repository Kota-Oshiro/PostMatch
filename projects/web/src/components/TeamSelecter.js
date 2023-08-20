import React from 'react';

import './TeamSelecter.css';

function TeamSelecter({ teams, handleTeamClick }) {
  return (
    <div className='team-selecter-container'>
      {teams.map(team => (
        <div
          key={team.id}
          className='team-selecter-item'
          onClick={() => handleTeamClick({
            id: team.id, 
            tla: team.tla, 
            name: team.name_ja
          })}
        >
          <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${team.tla}.webp`} className='team-selecter-img'/>
          <span className='team-selecter-text'>{team.name_ja}</span>
        </div>
      ))}
    </div>
  );
}

export default TeamSelecter;