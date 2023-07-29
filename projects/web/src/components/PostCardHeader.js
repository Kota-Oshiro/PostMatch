import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as ThreeDotLeaderIcon } from '../icons/three_dot_leader.svg';
import { ReactComponent as TwitterIcon } from '../icons/twitter_blue.svg';
import { ReactComponent as CopyIcon } from '../icons/copy.svg';
import { ReactComponent as AlartIcon } from '../icons/alart.svg';

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
        <div onClick={(e) => {e.stopPropagation(); navigation(`/user/${post.user.id}`)}}>
          <img src={post.user.profile_image} className='post-user-icon'/>
        </div> 
        <div className='post-header-user'>
          <div className='post-header-block'>
            <span className='post-user-name' onClick={(e) => {e.stopPropagation(); navigation(`/user/${post.user.id}`)}}>{post.user.name}</span>
            {post.user.support_team &&
            <div className='post-user-support' onClick={(e) => {e.stopPropagation(); navigation(`/team/${post.user.support_team.id}`)}}>
              <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/badge-${post.user.support_team.tla}.webp`} className='post-user-crest'/>
            </div>
            }
          </div>
          <span className='post-created'>{new Date(post.created_at).toLocaleString()}</span>
        </div>
      </div>
      <div className='post-header-right' onMouseLeave={() => setMenuVisible(false)}>
        <div className='ellipsis-icon-block' style={{display: isMenuVisible ? 'none' : 'flex'}} onClick={handleMenuClick} >
          <ThreeDotLeaderIcon className='ellipsis-icon' />
        </div>
        <div className='ellipsis-menu' style={{display: isMenuVisible ? 'flex' : 'none'}} onClick={(e) => e.stopPropagation()}>
          <a href={`https://twitter.com/share?url=https://post-match.com/posts/${post.id}&hashtags=ポストマッチ&via=postmatch_jp&text=${post.user.name}さんの観戦記録（${post.match.home_team.name_ja} vs ${post.match.away_team.name_ja}）`} target='_blank' className='ellipsis-menu-block'>
            <TwitterIcon className='ellipsis-menu-icon' />
          </a>
          <div id='copy-link-post' className='ellipsis-menu-block' onClick={handleCopyClick}>
            <CopyIcon className='ellipsis-menu-icon' />
          </div>
          <div className='copy-success-message' style={{display: isLinkCopied ? 'block' : 'none'}}>リンクをコピーしました</div>
            <div className='ellipsis-menu-block' onClick={(e) => {e.stopPropagation(); navigation('/'); }} >
              <AlartIcon className='ellipsis-menu-icon' />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostCardHeader;