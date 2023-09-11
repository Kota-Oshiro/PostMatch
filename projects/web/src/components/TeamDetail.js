import React, { useState, useEffect, useContext, useRef} from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';

import axios from 'axios';

import './TabContent.css';
import { ReactComponent as CrestIcon } from '../icons/crest.svg';

import { Loader, LoaderInTabContent, SkeletonScreenPost } from './Loader';
import NotFoundPage from './error/NotFoundPage';

// 初期表示で遅延読み込み対象
const PlayerList = React.lazy(() => import('./PlayerList'));
const PostList = React.lazy(() => import('./PostList'));
const SupporterList = React.lazy(() => import('./SupporterList'));

function TeamDetail() {

  const { id } = useParams();

  const [currentTab, setCurrentTab] = useState('detail'); 
  
  // タブクリック切り替え
  const openForm = (formName) => {
    setCurrentTab(formName);
  };

  //スワイプしたらcurrentTabの更新
  const tabs = ['detail', 'users', 'posts', 'motms'];

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

  // 初期レンダリング
  const fetchTeam = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/`);
    return res.data;
  };

  const { data, isLoading, isError, error } = useQuery(['team', id], fetchTeam, {
    retry: 0,
  });

  // 各タブのキャンセルトークン（データ取得が未完了の場合の初期化に使う）
  const sourceRefPosts = useRef(axios.CancelToken.source());
  const sourceRefMotms = useRef(axios.CancelToken.source());
  const sourceRefUsers = useRef(axios.CancelToken.source());

  // 各タブのフェッチ
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/posts/?page=${pageParam}`, {
      cancelToken: sourceRefPosts.current.token
    }); 
    return res.data;
  };

  const fetchMotms = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/motms/?page=${pageParam}`, {
      cancelToken: sourceRefMotms.current.token
    });
    return res.data;
  };

  const fetchUsers = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/users/?page=${pageParam}`, {
      cancelToken: sourceRefUsers.current.token
    });
    return res.data;
  };

  // 各タブのuseQuery
  const { data: dataPosts, isLoading: isLoadingPosts, isError: isErrorPosts, error: errorPosts, fetchNextPage: fetchNextPagePosts, hasNextPage: hasNextPagePosts, isFetchingNextPage: isFetchingNextPagePosts } = useInfiniteQuery(['posts', id], fetchPosts, {
    enabled: currentTab === 'posts', //タブがアクティブな時だけデータを取得
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  const { data: dataMotms, isLoading: isLoadingMotms, isError: isErrorMotms, error: errorMotms, fetchNextPage: fetchNextPageMotms, hasNextPage: hasNextPageMotms, isFetchingNextPage: isFetchingNextPageMotms } = useInfiniteQuery(['motms', id], fetchMotms, {
    enabled: currentTab === 'motms',
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  const { data: dataUsers, isLoading: isLoadingUsers, isError:isErrorUsers, error: errorUsers, fetchNextPage: fetchNextPageUsers, hasNextPage: hasNextPageUsers, isFetchingNextPage: isFetchingNextPageUsers } = useInfiniteQuery(['users', id], fetchUsers, {
    enabled: currentTab === 'users',
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
  const observerUsers = useRef(null)

  // infinityLoadの発火地点管理
  const ignitionPagePosts = useRef(null);
  const ignitionPageMotms = useRef(null);
  const ignitionPageUsers = useRef(null);

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

  useEffect(() => {
    if (!observerUsers.current) {
      observerUsers.current = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && hasNextPageUsers && !isFetchingNextPageUsers && currentTab === 'users') {
                  fetchNextPageMotms();
              }
          },
          { threshold: 1 }
      );
    }

    if (!isLoadingUsers && !isErrorUsers && ignitionPageUsers.current) {
      observerUsers.current.observe(ignitionPageUsers.current);
    }

    return () => {
      sourceRefUsers.current.cancel("Operation cancelled by user.");
      sourceRefUsers.current = axios.CancelToken.source(); 
      if (observerUsers.current) {
        observerUsers.current.disconnect();
      }
    };
  }, [dataUsers, isLoadingUsers, ignitionPageUsers, hasNextPageUsers, isFetchingNextPageUsers, currentTab, fetchNextPageUsers]);

  // 初期読み込み時のLoader
  if (isLoading) {
    return (
      <>
        <div className='bg'></div>
        <Loader />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <div className='bg'></div>
        <NotFoundPage />
      </>
    )
  }

  if (data) {
    const { team } = data;

    return (
      <>
        <Helmet>
          <title>{ team.name_ja }のチーム情報 - ポストマッチ</title>
          <meta property='og:title' content={`${data.name_ja}のチーム情報 - ポストマッチ`} />
        </Helmet>

        <div className='bg'></div>
        <div className='tab-container'>
          <div className='content-bg'  style={{backgroundImage: `linear-gradient(${team.club_color_code_first}, #f7f7f7 360px)`}} >
            <div className='tab-content'>
              <div className='tab-header'>
                <div className='tab-header-left'>
                  {team.competition_id !== 2119 ? (
                    <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${team.tla}.webp`} className='tab-header-icon' style={{transition: 'none'}}/>
                  ) : (
                    <CrestIcon className='tab-header-icon'/>
                  )}
                  <span className='tab-header-name-team'>{ team.name_ja }</span>
                </div>
              </div>
              <div className='activity-tab'>
                <div className={`activity-tab-column ${currentTab === 'detail' ? 'active' : ''}`} onClick={() => openForm('detail')}>
                  <span>情報</span>
                </div>
                <div className={`activity-tab-column ${currentTab === 'users' ? 'active' : ''}`} onClick={() => openForm('users')}>
                  <span>サポーター</span>
                </div>
                <div className={`activity-tab-column ${currentTab === 'posts' ? 'active' : ''}`} onClick={() => openForm('posts')}>
                  <span>ポスト</span>
                </div>
                <div className={`activity-tab-column ${currentTab === 'motms' ? 'active' : ''}`} onClick={() => openForm('motms')}>
                  <span>MOTM</span>
                </div>
              </div>        
            </div>
            <div className='activity-container' {...handlers}>
            {currentTab === 'detail' ? (
              <>
              <h2 className='activity-title'>クラブ情報</h2>
              <div className='activity-content add-padding'>
                <div className='tab-profile-item'>
                  <h3 className='tab-profile-column'>創設</h3>
                  <span>{ team.founded_year }年</span>
                </div>
                <div className='tab-profile-item'>
                  <h3 className='tab-profile-column'>スタジアム</h3>
                  <span>{ team.venue_ja }</span>
                </div>
                <div className='tab-profile-item'>
                  <h3 className='tab-profile-column'>略称</h3>
                  <span>{ team.tla }</span>
                </div>
                <div className='tab-profile-item'>
                  <h3 className='tab-profile-column'>監督</h3>
                  <span>{ team.coach_name_ja }</span>
                </div>
              </div>
              </>
            ) : currentTab === 'posts' ? (
              isLoadingPosts ? (
              <SkeletonScreenPost />
              ) : (
              <>
                <h2 className='activity-title'>{dataPosts.pages[0].count}件のポスト</h2>
                <PostList
                  data={dataPosts}
                  isLoading={isLoadingPosts}
                  isFetchingNextPage={isFetchingNextPagePosts}
                  ignitionPage={ignitionPagePosts}
                />
              </>
              )
            ) : currentTab === 'users' ? (
              isLoadingUsers ? (
              <LoaderInTabContent />
              ) : (
              <>
                <h2 className='activity-title'>{dataUsers.pages[0].count}人が応援</h2>
                <SupporterList
                  data={dataUsers}
                  isLoading={isLoadingUsers}
                  isFetchingNextPage={isFetchingNextPageUsers}
                  ignitionPage={ignitionPageUsers}
                />
              </>
              )
            ) : (
              isLoadingMotms ? (
              <LoaderInTabContent />
              ) : (
              <>
                <h2 className='activity-title'>マンオブザマッチ投票</h2>
                <PlayerList
                  data={dataMotms}
                  isLoading={isLoadingMotms}
                  isFetchingNextPage={isFetchingNextPageMotms}
                  ignitionPage={ignitionPageMotms}
                />
              </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )}
}

export default TeamDetail;