import React from 'react';

import './NoContent.css';
import { ReactComponent as NoContentIcon } from '../icons/nocontent.svg';

function NoContent() {

  return (
    <div className='nocontent'>
      <NoContentIcon className='nocontent-icon' />
      <h2 className='nocontent-text'>まだコンテンツがありません</h2>
    </div>
  );
}

export default NoContent;