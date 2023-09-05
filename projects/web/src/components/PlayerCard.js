import React from 'react';

import './PlayerCard.css';

function PlayerCard({ player, dataMatch}) {
      
    return (
        <div className='player'>
            <div className='player-block'>
                <span className='player-count'>{player.post_count}</span>
            </div>
            <span className='player-name'>{player.name_ja}</span>
        </div>
    );
  }
  
  export default PlayerCard;