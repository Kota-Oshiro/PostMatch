import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './PostCard.css';

import PostCardHeader from './PostCardHeader';
import PostCardTagMatch from './PostCardTagMatch';
import PostCardTagMotm from './PostCardTagMotm';

import { ReactComponent as ReadMoreIcon } from '../icons/arrow_down_white.svg';
import { ReactComponent as ReadMoreIconBelow } from '../icons/arrow_up_white.svg';

function PostCard({ post }) {

  const navigation  = useNavigate();

  const [isExpanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const mainTextRef = useRef(null);

  // 投稿テキストのアコーディオン処理
  useEffect(() => {
    const lineHeight = parseFloat(window.getComputedStyle(mainTextRef.current)['line-height']);
    const linesCount = Math.floor(mainTextRef.current.offsetHeight / lineHeight);
    
    if (linesCount > 7) {
      setIsLong(true);
      setExpanded(false);
    } else {
      setIsLong(false);
      setExpanded(true);
    }
  }, [post]);

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!isExpanded);
  };

  return (
    <div onClick={() => navigation(`/post/${post.id}`)} className={`post ${isExpanded && isLong ? 'expanded' : ''}`}>
      <PostCardHeader post={post} />
      <div className='post-tag'>
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
    </div>
  );
}
      
export default PostCard;
