import React, { useState, useEffect, useContext } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

import MotmSelectModal from './MotmSelectModal';

import './MatchPostForm.css';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

import { AuthContext } from '../AuthContext';
import { LoaderInButton } from './Loader';

import { ReactComponent as ArrowDownIcon } from '../icons/arrow_down.svg';
import { ReactComponent as ArrowUpIcon } from '../icons/arrow_up.svg';

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
      content: postContent
    };

    mutation.mutate(postData);
  }

  return (
    <div className='post-modal' id='post-modal'>
      <div className='post-modal-content'>
        <div onClick={ handleMenuClose } className='modal-close'>
          <CloseIcon className='modal-close-img'/>
        </div>
        <h2 className='modal-title'>ポストの作成</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor='pulldown'>マンオブザマッチ投票</label>
          
          <div className='custom-form' onClick={handleMotmSelectModal}>
            {postPlayerName ? (
              <span className='custom-form-text'>{postPlayerName}</span>
            ) : (
              <span className='custom-form-text'>プレイヤーを選んでください</span>
            )}
            {isMotmSelectModalVisible ? (
              <ArrowUpIcon className='custom-form-arrow' />
            ) : (
              <ArrowDownIcon className='custom-form-arrow' />
            )}
            {isMotmSelectModalVisible && <MotmSelectModal match={match} postPlayerList={postPlayerList} handlePlayerClick={handlePlayerClick} handleModalClose={handleModalClose} />}
          </div>

          <label htmlFor='content'>試合の感想</label>
          <textarea name='content' placeholder='（最大900文字）試合の感想を書いてみよう。 熱狂した瞬間、印象的だった選手やプレー、物足りなかったポイントなど何でもOK！' onChange={e => setPostContent(e.target.value)}></textarea>
          <button type='submit'>
            {!loaderInButton ? (
              <span className='button-text'>ポスト</span>
            ) : (
              <LoaderInButton />
            )}
          </button>
          {validateErrorMessage && <span className='error-message'>{validateErrorMessage}</span>}
        </form>
      </div>
    </div>
  );
}

export default MatchPostForm;
