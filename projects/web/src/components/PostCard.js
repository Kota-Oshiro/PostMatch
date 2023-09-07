import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './PostCard.css';

import PostCardHeader from './PostCardHeader';
import PostCardTagMatch from './PostCardTagMatch';
import PostCardTagMotm from './PostCardTagMotm';

import { ReactComponent as ReadMoreIcon } from '../icons/arrow_down_white.svg';
import { ReactComponent as ReadMoreIconBelow } from '../icons/arrow_up_white.svg';
import { ReactComponent as HighlightIcon } from '../icons/highlight.svg';

function PostCard({ post }) {

  const location = useLocation();
  const isPostDetail = location.pathname.includes("/post/")
  const isPosts = location.pathname === "/posts";

  const navigation  = useNavigate();

  const [isExpanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const mainTextRef = useRef(null);

  // 投稿テキストのアコーディオン処理
  useEffect(() => {
    const lineHeight = parseFloat(window.getComputedStyle(mainTextRef.current)['line-height']);
    const linesCount = Math.floor(mainTextRef.current.offsetHeight / lineHeight);
    
    if (!isPostDetail && linesCount > 7) {
      setExpanded(false);
      setIsLong(true);
    } else {
      setExpanded(true);
      setIsLong(false);
    }

  }, [post]);

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!isExpanded);
  };

  return (
    <div onClick={() => navigation(`/post/${post.id}`)} className={`post ${!isPosts && !isPostDetail && 'post-border'} ${ !post.is_highlight && isExpanded && isLong ? 'post-expand' : ''}`}>
      <PostCardHeader post={post} />
      <div className={`post-tag ${(post.content) ? 'post-tag-margin' : ''}`}>
        <PostCardTagMatch post={post} />  
        {post.player &&
          <PostCardTagMotm post={post} />  
        }
      </div>
      <div className='post-content'>
          <pre className='post-text' style={!isExpanded && isLong ? { display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }: {}} ref={mainTextRef}>{ post.content }</pre> 
        <div className={`fade-out ${isExpanded || !isLong ? '' : 'show'}`}></div>
        <div className={`read-more ${isExpanded && isLong ? 'below' : ''}`} style={{display: isLong ? 'inline-flex' : 'none'}} onClick={handleExpand}>
          <span className='read-more-text'>{isExpanded ? '閉じる' : '続きを読む'}</span>
          {isExpanded && isLong ? 
          <ReadMoreIconBelow className='read-more-icon' />
          :
          <ReadMoreIcon className='read-more-icon' />
          }
        </div>
      </div>
      {post.is_highlight &&
        <div className={`post-highlight ${(isExpanded && isLong) ? 'highlight-expand' : ''}`}>
          <HighlightIcon className='post-highlight-icon'/>
          <span className='post-highlight-text' >ハイライト視聴</span>
        </div>
      } 
    </div>
  );
}
      
export default PostCard;
