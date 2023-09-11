import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';
import axios from 'axios';

import { AuthContext } from '../AuthContext';

import MatchDetail from './MatchDetail';
import MatchFloatButton from './MatchFloatButton';
import MatchPostForm from './MatchPostForm';
import Login from './Login';
import NotFoundPage from './error/NotFoundPage';

import './Match.css';
import './TabContent.css';
import { Loader, LoaderInTabContent } from './Loader';

const PostList = React.lazy(() => import('./PostList.js'));
const PlayerList = React.lazy(() => import('./PlayerList'));

function Match() {

  const { isAuthenticated, currentUser, apiBaseUrl } = useContext(AuthContext);
  const { id } = useParams();

  const [currentTab, setCurrentTab] = useState('posts'); 
  const [hasWatched, setHasWatched] = useState(false);

  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [fetchedMatchPlayers, setFetchedMatchPlayers] = useState([]);

  const [postPlayerList, setPostPlayerList] = useState({ home_team_players: [], away_team_players: [] });
  const [postPlayerId, setPostPlayerId] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // タブをクリック切り替え
  const openForm = (formName) => {
    setCurrentTab(formName);
  };

  //スワイプしたらcurrentTabの更新
  const tabs = ['posts', 'motms'];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex < tabs.length - 1) {
        openForm(tabs[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex > 0) {
        openForm(tabs[currentIndex - 1]);
      }
    }
  });

  // matchのフェッチ
  const fetchMatch = async () => {
    const res = await apiBaseUrl.get(`/match/${id}/`);
    return res.data;
  };

  const { data, isLoading, isError, error } = useQuery(['match', id, currentUser], fetchMatch, {
    onSuccess: (data) => {
      setHasWatched(data.has_watched);
    },
    retry: 0,
  });

  // 各タブのキャンセルトークン（データ取得が未完了の場合の初期化に使う）
  const sourceRefPosts = useRef(axios.CancelToken.source());
  const sourceRefMotms = useRef(axios.CancelToken.source());

  // 各タブのフェッチ
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/match/${id}/posts/?page=${pageParam}`, {
      cancelToken: sourceRefPosts.current.token
    }); 
    return res.data;
  };

  const fetchMotms = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/match/${id}/motms/?page=${pageParam}`, {
      cancelToken: sourceRefMotms.current.token
    }); 
    return res.data;
  };

  // 各タブのuseQuery
  const { data: dataPosts, isLoading: isLoadingPosts, isError: isErrorPosts, error: errorPosts, fetchNextPage: fetchNextPagePosts, hasNextPage: hasNextPagePosts, isFetchingNextPage: isFetchingNextPagePosts, refetch: refetchPosts } = useInfiniteQuery(['posts', id], fetchPosts, {
    enabled: !isError,
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  const { data: dataMotms, isLoading: isLoadingMotms, isError:isErrorMotms, error: errorMotms, fetchNextPage: fetchNextPageMotms, hasNextPage: hasNextPageMotms, isFetchingNextPage: isFetchingNextPageMotms, refetch: refetchMotms } = useInfiniteQuery(['motms', id], fetchMotms, {
    enabled: currentTab === 'motms',
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  // 各タブのオブザーバー
  const observerPosts = useRef(null)
  const observerMotms = useRef(null)

  // infinityLoadの発火地点管理
  const ignitionPagePosts = useRef(null);
  const ignitionPageMotms = useRef(null);

  // 各タブのuseEffect
  useEffect(() => {
    if (!observerPosts.current) {
      observerPosts.current = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && hasNextPagePosts && !isFetchingNextPagePosts && currentTab === 'posts') {
                  fetchNextPageMotms();
              }
          },
          { threshold: 1 }
      );
    }

    // タブがアクティブであり、エラーやローディング状態でない場合、observer をアクティブにする
    if (!isLoadingPosts && !isErrorPosts && ignitionPagePosts.current) {
      observerPosts.current.observe(ignitionPagePosts.current);
    }

    // useEffect のクリーンアップ関数
    return () => {
      sourceRefPosts.current.cancel("Operation cancelled by user.");
      sourceRefPosts.current = axios.CancelToken.source(); 
      // observer が存在する場合、監視を停止
      if (observerPosts.current) {
        observerPosts.current.disconnect();
      }
    };
  }, [dataPosts, isLoadingPosts, ignitionPagePosts, hasNextPagePosts, isFetchingNextPagePosts, currentTab, fetchNextPagePosts]);

  useEffect(() => {
    if (!observerMotms.current) {
      observerMotms.current = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && hasNextPageMotms && !isFetchingNextPageMotms && currentTab === 'motms') {
                  fetchNextPageMotms();
              }
          },
          { threshold: 1 }
      );
    }

    if (!isLoadingMotms && !isErrorMotms && ignitionPageMotms.current) {
      observerMotms.current.observe(ignitionPageMotms.current);
    }

    return () => {
      sourceRefMotms.current.cancel("Operation cancelled by user.");
      sourceRefMotms.current = axios.CancelToken.source(); 
      if (observerMotms.current) {
        observerMotms.current.disconnect();
      }
    };
  }, [dataMotms, isLoadingMotms, ignitionPageMotms, hasNextPageMotms, isFetchingNextPageMotms, currentTab, fetchNextPageMotms]);

  if (isLoading) {
    return(
      <>
        <div className='bg'></div>      
        <Loader />
      </>
    )
  }

  if (isError) {
    return(
      <>
        <div className='bg'></div>      
        <NotFoundPage />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>{data.match.home_team.name_ja} vs {data.match.away_team.name_ja} - ポストマッチ</title>
        <meta property='og:title' content={`${data.match.home_team.name_ja} vs ${data.match.away_team.name_ja} - ポストマッチ`} />
      </Helmet>

      {isPostModalVisible &&
      <MatchPostForm
        match={data.match}
        matchId={id}
        currentUser={currentUser}
        isPostModalVisible={isPostModalVisible}
        setPostModalVisible={setPostModalVisible}
        fetchedMatchPlayers={fetchedMatchPlayers}
        setFetchedMatchPlayers={setFetchedMatchPlayers}
        postPlayerList={postPlayerList}
        setPostPlayerList={setPostPlayerList}
        postPlayerId={postPlayerId}
        setPostPlayerId={setPostPlayerId}
        refetchPosts={refetchPosts}
        refetchMotms={refetchMotms}
      />
      }

      <div className={`modal-overlay ${isPostModalVisible ? '' : 'hidden'}`}></div>
      <div className='bg'></div>      
      <div className='match-container'>
        <MatchDetail match={data.match} goals={data.goals} />
      </div>
      <MatchFloatButton
        matchId={id}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        hasWatched={hasWatched}
        setHasWatched={setHasWatched}
        setPostModalVisible={setPostModalVisible}
      />
      {!isAuthenticated && <Login /> }
  
      <div className='activity-container match-post-list'>
        <div className='activity-tab match-detail'>
          <div className={`activity-tab-column match-detail ${currentTab === 'posts' ? 'active' : ''}`} onClick={() => openForm('posts')}>
            <span>ポスト</span>
            {data.match && <span className='total-post-count'>{ data.match.total_post_count }</span>}
          </div>
          <div className={`activity-tab-column match-detail ${currentTab === 'motms' ? 'active' : ''}`} onClick={() => openForm('motms')}>
            <span>MOTM</span>
          </div>
        </div>
        <div {...handlers}>
        {currentTab === 'posts' ? (
          <>
            <h2 className='activity-title'>みんなのポスト</h2>
            <PostList
              data={dataPosts}
              isLoading={isLoadingPosts}
              isFetchingNextPage={isFetchingNextPagePosts}
              ignitionPage={ignitionPagePosts}
            />
          </>
          ) : (
          isLoadingMotms ? (
            <LoaderInTabContent />
          ) : (
          <>
            <h2 className='activity-title'>みんなが選んだマンオブザマッチ</h2>
            <PlayerList
              data={dataMotms}
              dataMatch={data}
              isFetchingNextPage={isFetchingNextPageMotms}
              ignitionPage={ignitionPageMotms}
            />
          </>
        ))}
        </div>
      </div>
    </>
  );
}

export default Match;