import React from 'react';
import './PlayerCard.css';

function PlayerCard({ player }) {
    return (
        <div className='player'>
            <div className='player-block'>
                <span className='player-count'>{player.post_count}</span>
            </div>
            <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/badge-${player.team.tla}.webp`} className='player-crest' />
            <span className='player-name'>{player.name_ja}</span>
        </div>
    );
  }
  
  export default PlayerCard;