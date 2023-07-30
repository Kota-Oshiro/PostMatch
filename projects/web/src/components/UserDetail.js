import React, { useState, useEffect, useContext, useRef} from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';
import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { formatUsing, formats } from '../DateFormat.js';

import './UserDetail.css';
import './TabContent.css';
import { ReactComponent as SettingIcon } from '../icons/setting.svg';
import { ReactComponent as TwitterIcon } from '../icons/twitter.svg';

import { Loader, LoaderInTabContent } from './Loader';
import NotFoundPage from './error/NotFoundPage';

// 初期表示で遅延読み込み対象
const PlayerList = React.lazy(() => import('./PlayerList'));
const ScheduleList = React.lazy(() => import('./ScheduleList'));
const PostList = React.lazy(() => import('./PostList'));

function UserDetail() {

  // userEditから更新完了してtoastMessageがsetされたタイミング表示
  let location = useLocation();

  const { id } = useParams();

  const { currentUser, setToastId, setToastMessage, setToastType } = useContext(AuthContext);

  const [currentTab, setCurrentTab] = useState('detail'); 

  // infinityLoadの発火地点管理
  const ignitionPagePosts = useRef(null);
  const ignitionPageMotms = useRef(null);
  const ignitionPageWatches = useRef(null);

  // タブクリック切り替え
  const openForm = (formName) => {
    setCurrentTab(formName);
  };

  //スワイプしたらcurrentTabの更新
  const tabs = ['detail', 'posts', 'motms', 'watches'];

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
  const fetchUser = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/`);
    return res.data;
  };
  
  const { data, isLoading, isError, error } = useQuery(['user', id], fetchUser, {
    retry: 0,
  });

  // ユーザー編集が完了したときのバナー通知
  useEffect(() => {
    if (location.state && location.state.from === 'userEdit') {
      window.scrollTo(0, 0);
      setToastId(uuidv4());
      setToastMessage(location.state.message);
      setToastType(location.state.type)
    }
  }, [location.state]);

  // postsのフェッチ
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/posts/?page=${pageParam}`);
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
  
  // motmsのfetchとobserver
  const fetchMotms = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/motms/?page=${pageParam}`);
    return res.data;
  };

  const { data: dataMotms, isLoading: isLoadingMotms, isError:isErrorMotms, error: errorMotms, fetchNextPage: fetchNextPageMotms, hasNextPage: hasNextPageMotms, isFetchingNextPage: isFetchingNextPageMotms } = useInfiniteQuery(['motms', id], fetchMotms, {
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

    if (!isLoadingMotms && !isErrorMotms && ignitionPageMotms.current) {
      observerMotms.observe(ignitionPageMotms.current);
    }
    return () => observerMotms.disconnect();
  }, [dataMotms, isLoadingMotms, ignitionPageMotms, hasNextPageMotms, isFetchingNextPageMotms, currentTab, fetchNextPageMotms]);

  // watchesのフェッチ
  const fetchWatches = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/watches/?page=${pageParam}`);
    return res.data;
  };

  const { data: dataWatches, isLoading: isLoadingWatches, isError: isErrorWatches, error: errorWatches, fetchNextPage: fetchNextPageWatches, hasNextPage: hasNextPageWatches, isFetchingNextPage: isFetchingNextPageWatches } = useInfiniteQuery(['watches', id], fetchWatches, {
    enabled: currentTab === 'watches',
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  // ここからwatchesのobserver
  const observerWatches = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasNextPageWatches && !isFetchingNextPageWatches && currentTab === 'watches') {
        fetchNextPageWatches();
      }
    },
    { threshold: 1 }
  );

  useEffect(() => {
    if (!isLoadingWatches && !isErrorWatches && ignitionPageWatches.current) {
      observerWatches.observe(ignitionPageWatches.current);
    }
    return () => observer.disconnect();
  }, [dataWatches, isLoadingWatches, ignitionPageWatches, hasNextPageWatches, isFetchingNextPageWatches, currentTab, fetchNextPageWatches]);

  // 初期読み込み時のLoader
  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <NotFoundPage />;
  }

  if (data) {
    const { account, support_years, support_months } = data;

    return (
      <>
      <Helmet>
        <title>{ account.name }さんのプロフィール - ポストマッチ</title>
        <meta property='og:title' content={`${account.name}さんのプロフィール - ポストマッチ`} />
      </Helmet>
      
      <div className='bg'></div>
      {account && (
      <div className='user-container'>
        <div className='user-profile' style={{backgroundColor: account.supported_at ? account.support_team?.club_color_code_first : '#3465FF'}}>
          <div className='user-profile-top'>
            <div className='user-profile-left'>
              <img src={ account.profile_image } className='user-profile-img' style={{transition: 'none'}}/>
              <div className='user-profile-block'>
                <div className='user-profile-main'>
                  <span className='user-name'>{ account.name }</span>
                  { account.supported_at && account.support_team &&
                  <Link to={`/team/${account.support_team.id}`}>
                    <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/crest-${account.support_team.tla}.webp`} className='user-support-crest'/>
                  </Link>}
                </div>
                <span className='user-profile-text-sub'>{formatUsing(account.created_at, formats.DATE)} 登録</span>
              </div>
            </div>
            {currentUser && currentUser.id ===  account.id &&
            <Link to='/user/edit'>
              <SettingIcon className='user-edit-icon'/>
            </Link>
            }
          </div>
          <div className='activity-tab-user'>
            <div className={`activity-tab-column-user ${currentTab === 'detail' ? 'active' : ''}`} onClick={() => openForm('detail')}>
              <span>紹介</span>
            </div>
            <div className={`activity-tab-column-user ${currentTab === 'posts' ? 'active' : ''}`} onClick={() => openForm('posts')}>
              <span>ポスト</span>
            </div>
            <div className={`activity-tab-column-user ${currentTab === 'motms' ? 'active' : ''}`} onClick={() => openForm('motms')}>
              <span>MOTM</span>
            </div>
            <div className={`activity-tab-column-user ${currentTab === 'watches' ? 'active' : ''}`} onClick={() => openForm('watches')}>
              <span>観戦済</span>
            </div>
          </div>        
        </div>
        <div className='activity-container-user' {...handlers}>
        {currentTab === 'detail' ? (
          <>
          <h2 className='activity-title'>プロフィール</h2>
          <div className='activity-content padding'>
            <div className='user-profile-item'>
              <h3 className='user-profile-item-column'>応援クラブ</h3>
              { account.support_team &&
              <Link to={`/team/${account.support_team.id}`} className='user-profile-text-team'>{ account.support_team.name_ja }</Link>
              }
            </div>
            <div className='user-profile-item'>
              <h3 className='user-profile-item-column'>サポーター歴</h3>
              { account.support_team &&
              <span>
                { support_years !== 0 &&
                  `${support_years}年`
                }
                {`${support_months}ヶ月`}
              </span>
              }   
            </div>
            <div className='user-profile-item'>
              <h3 className='user-profile-item-column'>自己紹介</h3>
                { account.description &&
                <pre className='user-profile-text-pre'>{ account.description }</pre>
                }
            </div>
            { account.twitter_id &&
            <a href={`https://twitter.com/${account.twitter_id}`} className='user-sns' target='_blank' rel='noopener noreferrer'>
              <TwitterIcon className='user-sns-icon'/>
            </a>
            }
          </div>
          </>
        ) : currentTab === 'motms' ? (
          isLoadingMotms ? (
            <LoaderInTabContent />
          ) : (
          <>
          <h2 className='activity-title add-padding'>マンオブザマッチ投票</h2>
          <PlayerList
            data={dataMotms}
            isLoading={isErrorMotms}
            isFetchingNextPage={isFetchingNextPageMotms}
            ignitionPage={ignitionPageMotms}
          />
          </>
          )
        ): currentTab === 'watches' ? (
          isLoadingWatches ? (
            <LoaderInTabContent />
          ) : (
          <>
          <h2 className='activity-title add-padding'>{ account.total_watch_count }回の観戦</h2>
          <ScheduleList
            data={dataWatches}
            isLoading={isErrorWatches}
            isFetchingNextPage={isFetchingNextPageWatches}
            ignitionPage={ignitionPageWatches}
          />
          </>
          )
        ) : (
          isLoadingPosts ? (
            <LoaderInTabContent />
          ) : (
          <>
          <h2 className='activity-title'>{ account.total_post_count }件のポスト</h2>
          <PostList
            data={dataPosts}
            isLoading={isLoadingPosts}
            isFetchingNextPage={isFetchingNextPage}
            ignitionPage={ignitionPagePosts}
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
}

export default UserDetail;