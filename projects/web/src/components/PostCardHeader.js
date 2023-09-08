import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReportForm } from './GoogleForm';

import { formatUsing, formats } from '../DateFormat.js';

import { ReactComponent as ThreeDotLeaderIcon } from '../icons/three_dot_leader.svg';
import { ReactComponent as XIcon } from '../icons/x_blue.svg';
import { ReactComponent as CopyIcon } from '../icons/copy.svg';

const PostCardHeader = ({ post }) => {

  const navigation  = useNavigate();

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLinkCopied, setLinkCopied] = useState(false);

  // 三点リーダーのクリック
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuVisible(true);
  };

  // コピーリンクのクリック
  const handleCopyClick = async (e) => {
    e.stopPropagation();

    const url = window.location.protocol + '//' + window.location.host + '/post/' + post.id;

    try {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);

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
    <div className='post-header'>
      <div className='post-header-left'>
        <div onClick={(e) => {e.stopPropagation(); navigation(`/user/${post.user.id}`)}} className='post-user-icon' >
          <img src={post.user.profile_image}/>
        </div> 
        <div className='post-header-user'>
          <div className='post-header-block'>
            <span className='post-user-name' onClick={(e) => {e.stopPropagation(); navigation(`/user/${post.user.id}`)}}>{post.user.name}</span>
            {post.user.support_team && post.user.support_team.competition_id !== 2119 &&
            <div className='post-user-support' onClick={(e) => {e.stopPropagation(); navigation(`/team/${post.user.support_team.id}`)}}>
              <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/badge-${post.user.support_team.tla}.webp`} className='post-user-crest'/>
            </div>
            }
          </div>
          <span className='post-created'>{formatUsing(post.created_at, formats.DATE_TIME)}</span>
        </div>
      </div>
      <div className='post-header-right' onMouseLeave={() => setMenuVisible(false)}>
        <div className='ellipsis-icon-block' style={{display: isMenuVisible ? 'none' : 'flex'}} onClick={handleMenuClick} >
          <ThreeDotLeaderIcon className='ellipsis-icon' />
        </div>
        <div className='ellipsis-menu' style={{display: isMenuVisible ? 'flex' : 'none'}} onClick={(e) => e.stopPropagation()}>
          <a href={`https://twitter.com/intent/tweet?url=https://post-match.com/post/${post.id}&hashtags=ポストマッチ&via=postmatch_jp&text=${post.user.name}さんの観戦記録（${post.match.home_team.name_ja} vs ${post.match.away_team.name_ja}）`} target='_blank' className='ellipsis-menu-block'>
            <XIcon className='ellipsis-menu-icon' />
          </a>
          <div id='copy-link-post' className='ellipsis-menu-block' onClick={handleCopyClick}>
            <CopyIcon className='ellipsis-menu-icon' />
          </div>
          <div className='copy-success-message' style={{display: isLinkCopied ? 'block' : 'none'}}>リンクをコピーしました</div>
          <ReportForm post={post.id} />
        </div>
      </div>
    </div>
  );
};

export default PostCardHeader;