import React, { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import './MatchFloatButton.css';

import { AuthContext } from '../AuthContext';

import { ReactComponent as PostIcon } from '../icons/post_white.svg';
import { ReactComponent as WatchIcon } from '../icons/watch.svg';
import { ReactComponent as WatchedIcon } from '../icons/watched.svg';

function MatchFloatButton({ matchId, isAuthenticated, currentUser, hasWatched, setHasWatched, setPostModalVisible }) {

  const { apiBaseUrl, setToastId, setToastMessage, setToastType } = useContext(AuthContext);

  const handleWatchCreate = async (event) => {
    event.preventDefault();
  
    const watchData = {
      match: matchId,
      user: currentUser.id,
    };
  
    if (!hasWatched) {
      setHasWatched(true);
      setToastId(uuidv4());
      setToastMessage('観戦済みに追加しました');
      setToastType('success');
      try {
        await apiBaseUrl.post(`/match/${matchId}/watch_create/${currentUser.id}/`, watchData);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error create watched data:', error);
        }
        setHasWatched(false);
        setToastId(uuidv4());
        setToastMessage('エラーが発生しました');
        setToastType('error');
      }
    } else {
      setHasWatched(false);
      setToastId(uuidv4());
      setToastMessage('観戦済みから削除しました');
      setToastType('delete');
      try {
        await apiBaseUrl.delete(`/match/${matchId}/watch_create/${currentUser.id}/`);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error delete watched data:', error);
        }
        setHasWatched(true);
        setToastId(uuidv4());
        setToastMessage('エラーが発生しました');
        setToastType('error');
      }
    }
  }

  const handlePostModal = (e) => {
    e.stopPropagation();
    setPostModalVisible(true);
  };

  if (isAuthenticated) {
    return (
      <div className='match-action-container'>
        <button
          onClick={handleWatchCreate}
          className='match-action-button-watch'
          style={{backgroundColor: hasWatched ? '#3465FF' : '#fff'}}
        >
          { hasWatched ? (
          <WatchedIcon className='match-action-icon'/>
          ) : (
          <WatchIcon className='match-action-icon'/>
          )}
          <span className='match-action-text' style={{color: hasWatched ? '#fff' : '#3465FF'}}>{hasWatched ? '観た' : '記録'}</span>
        </button>
        <button onClick={handlePostModal} className='match-action-button-post'>
          <PostIcon className='match-action-icon'/>
          <span className='match-action-text-post'>ポスト</span>
        </button>
      </div>
    );
  }
}

export default MatchFloatButton;
