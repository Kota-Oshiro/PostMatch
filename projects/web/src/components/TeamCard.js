import React from 'react';
import { Link } from 'react-router-dom';

import './TeamCard.css';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

function TeamCard({ team }) {

  return (
    <Link to={`/team/${team.id}`} className='team-card-link'>
    <div className='team-card'>
      <div className='team-list-block'>
        {team.competition_id !== 2119 ? (
          <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${team.tla}.webp`} className='team-list-crest'/>
        ) : (
          <CrestIcon className='team-list-crest' />
        )}
        <span className='team-list-name'>{team.name_ja}</span>
      </div>
      <span className='team-list-text'>{team.total_supporter_count}人が応援</span>
    </div>
    <div className='team-color-block' style={{backgroundColor: team.club_color_code_first }}></div>
    </Link>
  );
}

export default TeamCard;