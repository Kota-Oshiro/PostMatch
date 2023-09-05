import React, { useState, useEffect, useContext, useRef} from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';

import axios from 'axios';

import './TeamDetail.css';
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
  
  // infinityLoadの発火地点管理
  const ignitionPagePosts = useRef(null);
  const ignitionPageUsers = useRef(null);
  const ignitionPageMotms = useRef(null);

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

  // postsのフェッチ
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/posts/?page=${pageParam}`);
    return res.data;
  };

  const { data: dataPosts, isLoading: isLoadingPosts, isError:isErrorPosts, error: errorPosts, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(['posts', id], fetchPosts, {
    enabled: currentTab === 'posts', // 'motms'のタブがアクティブな時だけデータを取得
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  // ここからpostsのobserver
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && currentTab === 'posts') {
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
  }, [dataPosts, isLoadingPosts, ignitionPagePosts, hasNextPage, isFetchingNextPage, currentTab, fetchNextPage]);
  
  // usersのfetchとobserver
  const fetchUsers = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/users/?page=${pageParam}`);
    return res.data;
  };

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

  const observerUsers = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasNextPageUsers && !isFetchingNextPageUsers && currentTab === 'users') {
        fetchNextPageUsers();
      }
    },
    { threshold: 1 }
  );

  useEffect(() => {
    if (!isLoadingUsers && isErrorUsers && ignitionPageUsers.current) {
      observerUsers.observe(ignitionPageUsers.current);
    }
    return () => observerUsers.disconnect();
  }, [dataUsers, isLoadingUsers, ignitionPageUsers, hasNextPageUsers, isFetchingNextPageUsers, currentTab, fetchNextPageUsers]);


  // motmsのfetchとobserver
  const fetchMotms = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${id}/motms/?page=${pageParam}`);
    return res.data;
  };

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

  useEffect(() => {

    const observerMotms = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPageMotms && !isFetchingNextPageMotms && currentTab === 'motms') {
          fetchNextPageMotms();
        }
      },
      { threshold: 1 }
    );

    if (!isLoadingMotms && !isErrorMotms && ignitionPageMotms.current) {
      observerMotms.observe(ignitionPageMotms.current);
    }
    return () => observerMotms.disconnect();
  }, [dataMotms, isLoadingMotms, ignitionPageMotms, hasNextPageMotms, isFetchingNextPageMotms, currentTab, fetchNextPageMotms]);

  // 初期読み込み時のLoader
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Helmet>
        <title>{ data.team.name_ja }のチーム情報 - ポストマッチ</title>
        <meta property='og:title' content={`${data.name_ja}のチーム情報 - ポストマッチ`} />
      </Helmet>
      <div className='bg'></div>
      { data && (
      <div className='team-container'>
        <div className='team-profile' style={{backgroundColor: data.team.club_color_code_first }}>
          <div className='team-profile-top'>
            <div className='team-profile-left'>
              {data.team.competition_id !== 2119 ? (
                <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${data.team.tla}.webp`} className='team-profile-img' style={{transition: 'none'}}/>
              ) : (
                <CrestIcon className='team-profile-img'/>
              )}
              <span className='team-name'>{ data.team.name_ja }</span>
            </div>
          </div>
          <div className='activity-tab-team'>
            <div className={`activity-tab-column-team ${currentTab === 'detail' ? 'active' : ''}`} onClick={() => openForm('detail')}>
              <span>情報</span>
            </div>
            <div className={`activity-tab-column-team ${currentTab === 'users' ? 'active' : ''}`} onClick={() => openForm('users')}>
              <span>サポーター</span>
            </div>
            <div className={`activity-tab-column-team ${currentTab === 'posts' ? 'active' : ''}`} onClick={() => openForm('posts')}>
              <span>ポスト</span>
            </div>
            <div className={`activity-tab-column-team ${currentTab === 'motms' ? 'active' : ''}`} onClick={() => openForm('motms')}>
              <span>MOTM</span>
            </div>
          </div>        
        </div>
        <div className='activity-container-team' {...handlers}>
        {currentTab === 'detail' ? (
          <>
          <h2 className='activity-title'>クラブ情報</h2>
          <div className='activity-content padding'>
            <div className='team-profile-item'>
              <h3 className='team-profile-item-column'>創設</h3>
              <span>{ data.team.founded_year }年</span>
            </div>
            <div className='team-profile-item'>
              <h3 className='team-profile-item-column'>スタジアム</h3>
              <span>{ data.team.venue_ja }</span>
            </div>
            <div className='team-profile-item'>
              <h3 className='team-profile-item-column'>略称</h3>
              <span>{ data.team.tla }</span>
            </div>
            <div className='team-profile-item'>
              <h3 className='team-profile-item-column'>監督</h3>
              <span>{ data.team.coach_name_ja }</span>
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
              isFetchingNextPage={isFetchingNextPage}
              ignitionPage={ignitionPagePosts}
            />
          </>
          )
        ) : currentTab === 'users' ? (
          isLoadingUsers ? (
          <LoaderInTabContent />
          ) : (
          <>
            <h2 className='activity-title add-padding'>{dataUsers.pages[0].count}人が応援</h2>
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
            <h2 className='activity-title add-padding'>マンオブザマッチ投票</h2>
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
      )}
    </>
  )
}

export default TeamDetail;