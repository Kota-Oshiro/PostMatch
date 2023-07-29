import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';
import axios from 'axios';

import { AuthContext } from '../AuthContext';

import './Match.css';
import './TabContent.css';

import MatchDetail from './MatchDetail';
import MatchFloatButton from './MatchFloatButton';
import MatchPostForm from './MatchPostForm';
import Login from './Login';
import NotFoundPage from './error/NotFoundPage';

import { Loader } from './Loader';

const PostList = React.lazy(() => import('./PostList.js'));
const PlayerList = React.lazy(() => import('./PlayerList'));

function Match() {

  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const { id } = useParams();

  // infinityLoadの発火地点管理
  const ignitionPagePosts = useRef(null);
  const ignitionPageMotms = useRef(null);

  const [currentTab, setCurrentTab] = useState('posts'); 
  const [hasWatched, setHasWatched] = useState(false);

  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [fetchedMatchPlayers, setFetchedMatchPlayers] = useState([]);

  const [postPlayerList, setPostPlayerList] = useState({ home_team_players: [], away_team_players: [] });
  const [postPlayerId, setPostPlayerId] = useState('');

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
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/match/${id}/`, {withCredentials: true});
    return res.data;
  };

  const { data, isLoading, isError, error } = useQuery(['match', id, currentUser], fetchMatch, {
    onSuccess: (data) => {
      setHasWatched(data.has_watched);
    },
    retry: 0,
  });

  // postsのフェッチ（infinity load）
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/match/${id}/posts/?page=${pageParam}`);
    return res.data;
  };

  const { data: dataPosts, isLoading: isLoadingPosts, isError: isErrorPosts, fetchNextPage, hasNextPage, isFetchingNextPage, refetch  } = useInfiniteQuery(['posts', id], fetchPosts, {
    enabled: !isError,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    }
  });

  // ここからpostsのobserver
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1 }
  );

  useEffect(() => {
    if (!isLoadingPosts && !isErrorPosts && ignitionPagePosts.current) {
      observer.observe(ignitionPagePosts.current);
    }
    return () => observer.disconnect();
  }, [observer, isLoadingPosts, ignitionPagePosts]);
  //ここまでpostsのobserver


  // motmsのfetchとobserver
  const fetchMotms = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/match/${id}/motms/?page=${pageParam}`);
    return res.data;
  };

  const { data: dataMotms, status: statusMotms, isLoading: isLoadingMotms, isError: isErrorMotms, fetchNextPage: fetchNextPageMotms, hasNextPage: hasNextPageMotms, isFetchingNextPage: isFetchingNextPageMotms } = useInfiniteQuery(['motms', id], fetchMotms, {
    enabled: currentTab === 'motms', // 'motms'のタブがアクティブな時だけデータを取得
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  useEffect(() => {
    const observerMotms = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPageMotms && !isFetchingNextPageMotms && currentTab === 'motms') {
          fetchNextPageMotms();
        }
      },
      { threshold: 1 }
    );

    if (statusMotms  === 'success' && ignitionPageMotms.current) {
      observerMotms.observe(ignitionPageMotms.current);
    }
    return () => observerMotms.disconnect();
  }, [dataMotms, isLoadingMotms, ignitionPageMotms, hasNextPageMotms, isFetchingNextPageMotms, currentTab, fetchNextPageMotms]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <NotFoundPage />;
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
        refetchPosts={refetch}
      />
      }

      <div className={`modal-overlay ${isPostModalVisible ? '' : 'hidden'}`}></div>
      <div className='bg'></div>      
      <div className='match-container'>
        <MatchDetail match={data.match} />
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
  
      <div className='activity-container'>
        <div className='activity-tab'>
          <div className={`activity-tab-column ${currentTab === 'posts' ? 'active' : ''}`} onClick={() => openForm('posts')}>
            <span>ポスト</span>
            {data.match && <span className='total-post-count'>{ data.match.total_post_count }</span>}
          </div>
          <div className={`activity-tab-column ${currentTab === 'motms' ? 'active' : ''}`} onClick={() => openForm('motms')}>
            <span>マンオブザマッチ</span>
          </div>
        </div>
        <div {...handlers}>
        {currentTab === 'posts' ? (
          <>
            <h2 className='activity-title'>みんなのポスト</h2>
            <PostList
              data={dataPosts}
              isLoading={isLoadingPosts}
              isFetchingNextPage={isFetchingNextPage}
              ignitionPage={ignitionPagePosts}
            />
          </>
          ) : (
          isLoadingMotms ? (
            <Loader />
          ) : (
          <>
            <h2 className='activity-title add-padding'>みんなが選んだマンオブザマッチ</h2>
            <PlayerList
              data={dataMotms}
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