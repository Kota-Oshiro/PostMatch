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
import { ReactComponent as XIcon } from '../icons/x_black.svg';

import { Loader, LoaderInTabContent, SkeletonScreenPost } from './Loader';
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

  // 各タブのキャンセルトークン（データ取得が未完了の場合の初期化に使う）
  const sourceRefPosts = useRef(axios.CancelToken.source());
  const sourceRefMotms = useRef(axios.CancelToken.source());
  const sourceRefWatches = useRef(axios.CancelToken.source());

  // 各タブのフェッチ
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/posts/?page=${pageParam}`, {
      cancelToken: sourceRefPosts.current.token
    }); 
    return res.data;
  };

  const fetchMotms = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/motms/?page=${pageParam}`, {
      cancelToken: sourceRefMotms.current.token
    });
    return res.data;
  };

  const fetchWatches = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/${id}/watches/?page=${pageParam}`, {
      cancelToken: sourceRefWatches.current.token
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

  const { data: dataMotms, isLoading: isLoadingMotms, isError:isErrorMotms, error: errorMotms, fetchNextPage: fetchNextPageMotms, hasNextPage: hasNextPageMotms, isFetchingNextPage: isFetchingNextPageMotms } = useInfiniteQuery(['motms', id], fetchMotms, {
    enabled: currentTab === 'motms',
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

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

  // 各タブのオブザーバー
  const observerPosts = useRef(null)
  const observerMotms = useRef(null)
  const observerWatches = useRef(null)

  // infinityLoadの発火地点管理
  const ignitionPagePosts = useRef(null);
  const ignitionPageMotms = useRef(null);
  const ignitionPageWatches = useRef(null);

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
    if (!observerWatches.current) {
      observerWatches.current = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && hasNextPageWatches && !isFetchingNextPageWatches && currentTab === 'watches') {
                  fetchNextPageMotms();
              }
          },
          { threshold: 1 }
      );
    }

    if (!isLoadingWatches && !isErrorWatches && ignitionPageWatches.current) {
      observerWatches.current.observe(ignitionPageWatches.current);
    }

    return () => {
      sourceRefWatches.current.cancel("Operation cancelled by user.");
      sourceRefWatches.current = axios.CancelToken.source(); 
      if (observerWatches.current) {
        observerWatches.current.disconnect();
      }
    };
  }, [dataWatches, isLoadingWatches, ignitionPageWatches, hasNextPageWatches, isFetchingNextPageWatches, currentTab, fetchNextPageWatches]);

  // ユーザー編集が完了したときのバナー通知
  useEffect(() => {
    if (location.state && location.state.from === 'userEdit') {
      window.scrollTo(0, 0);
      setToastId(uuidv4());
      setToastMessage(location.state.message);
      setToastType(location.state.type)
    }
  }, [location.state]);

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
    const { account, support_years, support_months } = data;

    return (
      <>
      <Helmet>
        <title>{ account.name }さんのプロフィール - ポストマッチ</title>
        <meta property='og:title' content={`${account.name}さんのプロフィール - ポストマッチ`} />
      </Helmet>
      
      <div className='bg'></div>
      {account && (
      <div className='tab-container'>
        <div className='content-bg' style={{backgroundImage: `linear-gradient(${account.support_team ? account.support_team.club_color_code_first : '#3465FF'}, #f7f7f7 360px)`}}>
          <div className='tab-content'> 
            <div className='tab-header'>
              <div className='tab-header-left'>
                <img src={ account.profile_image } className='tab-header-user-icon' style={{transition: 'none'}}/>
                <div className='user-profile-block'>
                  <div className='user-profile-main'>
                    <span className='tab-header-name'>{ account.name }</span>
                    { account.support_team && account.support_team.competition_id !== 2119 &&

                      <Link to={`/team/${account.support_team.id}`}>
                        <img src={`https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Crest/${account.support_team.crest_name}.webp`} className='user-support-crest'/>
                      </Link>
                    }
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
            <div className='activity-tab'>
              <div className={`activity-tab-column ${currentTab === 'detail' ? 'active' : ''}`} onClick={() => openForm('detail')}>
                <span>紹介</span>
              </div>
              <div className={`activity-tab-column ${currentTab === 'posts' ? 'active' : ''}`} onClick={() => openForm('posts')}>
                <span>ポスト</span>
              </div>
              <div className={`activity-tab-column ${currentTab === 'motms' ? 'active' : ''}`} onClick={() => openForm('motms')}>
                <span>MOTM</span>
              </div>
              <div className={`activity-tab-column ${currentTab === 'watches' ? 'active' : ''}`} onClick={() => openForm('watches')}>
                <span>観戦済</span>
              </div>
            </div>        
          </div>
          <div className='activity-container' {...handlers}>
          {currentTab === 'detail' ? (
            <>
            <h2 className='activity-title'>プロフィール</h2>
            <div className='activity-content add-padding'>
              <div className='tab-profile-item'>
                <h3 className='tab-profile-column'>応援クラブ</h3>
                { account.support_team &&
                <Link to={`/team/${account.support_team.id}`} className='tab-profile-link'>{ account.support_team.name_ja }</Link>
                }
              </div>
              <div className='tab-profile-item'>
                <h3 className='tab-profile-column'>サポーター歴</h3>
                { account.support_team && account.supported_at &&
                <span>
                  { support_years !== 0 &&
                    `${support_years}年`
                  }
                  {`${support_months}ヶ月`}
                </span>
                }   
              </div>
              <div className='tab-profile-item'>
                <h3 className='tab-profile-column'>自己紹介</h3>
                  { account.description &&
                  <pre className='tab-profile-pre'>{ account.description }</pre>
                  }
              </div>
              { account.twitter_id &&
              <a href={`https://twitter.com/${account.twitter_id}`} className='tab-sns-link' target='_blank' rel='noopener noreferrer'>
                <XIcon className='tab-sns-icon'/>
              </a>
              }
            </div>
            </>
          ) : currentTab === 'motms' ? (
            isLoadingMotms ? (
              <LoaderInTabContent />
            ) : (
            <>
            <h2 className='activity-title'>マンオブザマッチ投票</h2>
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
            <h2 className='activity-title'>{ account.total_watch_count }回の観戦</h2>
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
              <SkeletonScreenPost />
            ) : (
            <>
            <h2 className='activity-title'>{ account.total_post_count }件のポスト</h2>
            <PostList
              data={dataPosts}
              isLoading={isLoadingPosts}
              isFetchingNextPage={isFetchingNextPagePosts}
              ignitionPage={ignitionPagePosts}
            />
            </>
            )
          )}
          </div>
        </div>
      </div>
      )}
      </>
    )
  }
}

export default UserDetail;