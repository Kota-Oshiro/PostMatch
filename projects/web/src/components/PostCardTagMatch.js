import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

const PostCardTagMatch = ({ post }) => {

  const navigation  = useNavigate();

  return (
    <div className='post-tag-match' onClick={(e) => {e.stopPropagation(); navigation(`/match/${post.match.id}`)}}>
      <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/badge-${ post.match.home_team.tla }.webp`} className='post-match-icon'/>
      {postTagStatus(post)}
      <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/badge-${ post.match.away_team.tla }.webp`} className='post-match-icon'/>
      <span className='post-match-text'>マッチデイ{ post.match.matchday }</span>
    </div> 
  );
};

function postTagStatus(post) {
  if (post.match.status === 'FINISHED') {
    return (
      <span className='post-match-text'>{ post.match.home_score } - { post.match.away_score }</span>
    );
  } else {
    return (
      <span className='post-match-text'>{formatUsing(post.match.started_at, formats.HOUR_MINUTE)}</span>
    );
  }
}

export default PostCardTagMatch;