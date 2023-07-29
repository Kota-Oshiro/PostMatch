import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import './MatchPostForm.css';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

import { AuthContext } from '../AuthContext';
import { LoaderInButton } from './Loader';

function MatchPostForm({ 
    match, matchId, currentUser,
    isPostModalVisible, setPostModalVisible,
    fetchedMatchPlayers, setFetchedMatchPlayers,
    postPlayerList, setPostPlayerList, postPlayerId, setPostPlayerId,
    refetchPosts
  }) {

  const { setToastId, setToastMessage, setToastType } = useContext(AuthContext);

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
        // ローカルストレージからトークンを取得
        const token = localStorage.getItem('access');
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/match/${matchId}/posts/players/`, {withCredentials: true});
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
  
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/match/${matchId}/post_create/`, postData, {withCredentials: true});
      setLoaderInButton(false)
      setPostModalVisible(false);
      setToastId(uuidv4());
      setToastMessage('投稿が完了しました')
      setToastType('postSuccess')
      await refetchPosts();


    } catch (error) {
      console.error(error);
      setLoaderInButton(false)
      setPostModalVisible(false);
      setToastId(uuidv4());
      setToastMessage('エラーが発生しました')
      setToastType('error')
    }
  }

  return (
    <div className='post-modal' id='post-modal'>
      <div className='post-modal-content'>
        <div onClick={ handleMenuClose } className='modal-close'>
          <CloseIcon className='modal-close-img'/>
        </div>
        <h2 className='modal-title'>ポストの作成</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor='pulldown'>あなたが選ぶマンオブザマッチ</label>
          <select className='player-select' name='player_id' onChange={e => setPostPlayerId(e.target.value)}>
            <option value=''>プレイヤーを選んでください</option>
            <optgroup label={match.home_team.name_ja}>
              {postPlayerList.home_team_players.map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </optgroup>
            <optgroup label={match.away_team.name_ja}>
              {postPlayerList.away_team_players.map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </optgroup>
          </select>
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
