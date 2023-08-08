import React from 'react';

import { ReactComponent as TrophyIcon } from '../icons/trophy.svg';

const PostCardTagMotm = ({ post }) => {

  return (
    <div className='post-tag-motm'>
        <TrophyIcon className='post-match-icon' />
        <span className='post-match-text-motm'>{ post.player.name_ja }</span>
    </div>
  );
};

export default PostCardTagMotm;