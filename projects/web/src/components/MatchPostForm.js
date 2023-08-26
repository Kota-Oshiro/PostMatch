import React, { useState, useEffect, useContext } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

import MotmSelectModal from './MotmSelectModal';

import './MatchPostForm.css';
import { ReactComponent as CloseIcon } from '../icons/close.svg';
import { ReactComponent as ArrowDownIcon } from '../icons/arrow_down.svg';
import { ReactComponent as ArrowUpIcon } from '../icons/arrow_up.svg';
import { ReactComponent as HighlightIcon } from '../icons/highlight.svg';
import { ReactComponent as HighlightFillIcon } from '../icons/highlight_fill_white.svg';

import { AuthContext } from '../AuthContext';
import { LoaderInButton } from './Loader';

function MatchPostForm({ 
    match, matchId, currentUser,
    isPostModalVisible, setPostModalVisible,
    fetchedMatchPlayers, setFetchedMatchPlayers,
    postPlayerList, setPostPlayerList, postPlayerId, setPostPlayerId,
    refetchPosts
  }) {

  const queryClient = useQueryClient();

  const { apiBaseUrl, setToastId, setToastMessage, setToastType } = useContext(AuthContext);

  const [isMotmSelectModalVisible, setMotmSelectModalVisible] = useState(false);
  const [postPlayerName, setPostPlayerName] =  useState('');

  const [isHighlightWatch, setHighlightWatch] = useState(false);
  const CurrentHighlightIcon = isHighlightWatch ? HighlightFillIcon : HighlightIcon;

  const [charCount, setCharCount] = useState(0);
  const [postContent, setPostContent] = useState('');

  const [validateErrorMessage, setValidateErrorMessage] = useState('');
  const [loaderInButton, setLoaderInButton] = useState(false);

  useEffect(() => {
    if (isPostModalVisible) {
      // モーダルが開いている時はスクロールを無効にする
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じている時はスクロールを有効にする
      document.body.style.overflow = 'visible';
    }

    return () => {
      // コンポーネントがアンマウントされたときはスクロールを再度有効にする
      document.body.style.overflow = 'visible';
    };
  }, [isPostModalVisible]);

  useEffect(() => {
    if (isPostModalVisible && !fetchedMatchPlayers.includes(matchId)) {
      const fetchMatchPlayerList = async () => {
        const res = await apiBaseUrl.get(`/match/${matchId}/posts/players/`);
        if (res.data.home_team_players && res.data.away_team_players) {
          setPostPlayerList({ 
            home_team_players: res.data.home_team_players,
            away_team_players: res.data.away_team_players,
          });
          setFetchedMatchPlayers(prevIds => [...prevIds, matchId]);
        }
      };
  
      fetchMatchPlayerList();
    }
  }, [isPostModalVisible, matchId]);

  const handleMenuClose = () => {
    setPostPlayerId('');
    setPostModalVisible(false);
  }

  // モーダル以外をクリックすると閉じる
  useEffect(() => {
    const handleOutsideClick = (event) => {
      setPostModalVisible((currentIsVisible) => {
        if (currentIsVisible && !document.getElementById('post-modal').contains(event.target)) {
          return false;
        }
        return currentIsVisible;
      });
    };
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleMotmSelectModal = (e) => {
    e.stopPropagation();
    setMotmSelectModalVisible(prevState => !prevState);
  };

  const handleModalClose = () => {
    setMotmSelectModalVisible(false);
  };

  const handlePlayerClick = (playerId, playerName, e) => {
    e.stopPropagation();
    setPostPlayerId(playerId);
    setPostPlayerName(playerName);
    setMotmSelectModalVisible(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      setMotmSelectModalVisible((currentIsVisible) => {
        if (currentIsVisible && !document.getElementById('motm-select-modal').contains(event.target)) {
          return false;
        }
        return currentIsVisible;
      });
    };
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // ハイライト視聴のセット
  const handleHighlightClick = (e) => {
    e.stopPropagation();
    setHighlightWatch(prevState => !prevState);
  };

  const handleContentChange = (e) => {
    setPostContent(e.target.value);
    setCharCount(e.target.value.length);
  }

  // データ送信のためのMutationの作成
  const mutation = useMutation(
    postData => apiBaseUrl.post(`/match/${matchId}/post_create/`, postData),
    {
      onSuccess: async () => {
        setLoaderInButton(false)
        setPostModalVisible(false);
        setToastId(uuidv4());
        setToastMessage('投稿が完了しました')
        setToastType('postSuccess')
        await refetchPosts();
        // 送信が成功したら親のクエリを再取得する
        queryClient.invalidateQueries(['match', matchId, currentUser]);
      },
      onError: (error) => {
        console.error(error);
        setLoaderInButton(false)
        setPostModalVisible(false);
        setToastId(uuidv4());
        setToastMessage('エラーが発生しました')
        setToastType('error')
      },
    }
  );
  
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!postPlayerId && !postContent) {
      setValidateErrorMessage('マンオブザマッチとレビューのどちらかは入力必須です');
      return;
    }

    setLoaderInButton(true)
  
    const postData = {
      match: matchId,
      user: currentUser.id,
      player_id: postPlayerId,
      content: postContent,
      is_highlight: isHighlightWatch
    };

    mutation.mutate(postData);
  }

  return (
    <div className='post-modal' id='post-modal'>
      <form onSubmit={handleSubmit} className='post-modal-form'>

        <div onClick={ handleMenuClose } className='post-modal-close'>
          <CloseIcon className='modal-close-icon'/>
        </div>
        <h2 className='post-modal-title'>観戦記録</h2>
        <button type='submit' className='post-modal-submit'>
          {!loaderInButton ? (
            <span className='button-text'>投稿</span>
          ) : (
            <LoaderInButton />
          )}
        </button>
        
        {validateErrorMessage && <span className='error-message'>{validateErrorMessage}</span>}

        <div className='post-modal-selecter' onClick={handleMotmSelectModal}>
          <div className='post-modal-motm' onClick={handleMotmSelectModal}>
            {postPlayerName ? (
              <span className='custom-form-text'>{postPlayerName}</span>
            ) : (
              <span className='custom-form-text'>マンオブザマッチを選ぶ</span>
            )}
            {isMotmSelectModalVisible ? (
              <ArrowUpIcon className='custom-form-arrow' />
            ) : (
              <ArrowDownIcon className='custom-form-arrow' />
            )}
            {isMotmSelectModalVisible && <MotmSelectModal match={match} postPlayerList={postPlayerList} handlePlayerClick={handlePlayerClick} handleModalClose={handleModalClose} />}
          </div>
          <div className={`post-modal-highlight ${isHighlightWatch ? 'highlighted' : ''}`} onClick={handleHighlightClick} >
            <CurrentHighlightIcon className='post-modal-icon'/>
            <span className={`post-modal-highlight-text ${isHighlightWatch ? 'highlighted' : ''}`}>ハイライト視聴</span>
          </div>
        </div>

        <textarea
          name='content'
          className='post-modal-textarea'
          placeholder='試合の感想を書いてみよう。熱狂した瞬間、印象的だった選手やプレー、物足りなかったポイントなど何でもOK！'
          onChange={handleContentChange}
        >
        </textarea>
        <span className='post-modal-char-counter'>{charCount} / 900</span>
      </form>
    </div>
  );
}

export default MatchPostForm;
