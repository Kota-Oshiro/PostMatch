import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUsing, formats } from '../DateFormat.js';

const PostCardTagMatch = ({ post }) => {

  const navigation  = useNavigate();

  return (
    <div className='post-tag-match' onClick={(e) => {e.stopPropagation(); navigation(`/match/${post.match.id}`)}}>
      {post.match.competition_id !== 2119 ? (
        <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/${ post.match.home_team.badge_name }.webp`} className='post-match-icon'/>
      ) : (
        <span className='post-match-tla'>{ post.match.home_team.tla }</span>
      )}
      {postTagStatus(post)}
      {post.match.competition_id !== 2119 ? (
        <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Badge/${ post.match.away_team.badge_name }.webp`} className='post-match-icon'/>
      ) : (
        <span className='post-match-tla'>{ post.match.away_team.tla}</span>
      )}
      {(post.match.competition_id !== 10000001 && post.match.competition_id !== 10000002) && (
        <span className='post-match-matchday'>{ post.match.matchday }節</span>
      )}
    </div> 
  );
};

function postTagStatus(post) {
  if (post.match.status === 'FINISHED') {
    return (
      <span className='post-match-status'>{ post.match.home_score } - { post.match.away_score }</span>
    );
  } else {
    return (
      <span className='post-match-status'>{formatUsing(post.match.started_at, formats.HOUR_MINUTE)}</span>
    );
  }
}

export default PostCardTagMatch;