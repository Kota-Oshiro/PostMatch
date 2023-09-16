import React, { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../AuthContext';

import './PostDetailFloatButton.css';

import { ReactComponent as XIcon } from '../icons/x_white.svg';
import { ReactComponent as CopyIcon } from '../icons/link_grey.svg';

function PostDetailFloatButton({ post }) {

  const { setToastId, setToastMessage, setToastType } = useContext(AuthContext);

  const [isLinkCopied, setLinkCopied] = useState(false);

  // コピーリンクのクリック
  const handleCopyClick = async (e) => {
    e.stopPropagation();

    const url = window.location.protocol + '//' + window.location.host + '/post/' + post.id;

    try {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setToastId(uuidv4());
        setToastMessage('リンクをコピーしました')
        setToastType('notify')
        setTimeout(function() {
            setLinkCopied(false);
        }, 2000);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to copy URL:', error);
        }
    }
  };

  return (
    <div className='post-share-container'>
      <a className='share-button-x' href={`https://twitter.com/intent/tweet?url=https://post-match.com/post/${post.id}&hashtags=ポストマッチ&via=postmatch_jp&text=${post.user.name}さんの観戦記録（${post.match.home_team.name_ja} vs ${post.match.away_team.name_ja}）`} target='_blank'>
        <XIcon className='post-share-icon' />
      </a>
      <button onClick={handleCopyClick} className='share-button'>
        <CopyIcon className='post-share-icon'/>
      </button>
    </div>
  );
}

export default PostDetailFloatButton;
