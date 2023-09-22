import React, { useEffect, useRef} from 'react';
import { useInfiniteQuery } from 'react-query';
import axios from 'axios';
import { Helmet } from 'react-helmet';

import './TabContent.css';
import PostList from './PostList';
import NotFoundPage from './error/NotFoundPage';

import { SkeletonScreenPost } from './Loader';

function Posts() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ignitionPage = useRef(null);

  // 初期レンダリング
  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/posts/?page=${pageParam}`);
    return res.data;
  };

  const { data, isLoading, status, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(['posts'], fetchPosts, {
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
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1 }
  );

  useEffect(() => {
    if (!isLoading && !isError && ignitionPage.current) {
      observer.observe(ignitionPage.current);
    }
    return () => observer.disconnect();
  }, [observer, status, ignitionPage]);
 
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
        <title>みんなの観戦記録 - ポストマッチ</title>
        <meta property='og:title' content='みんなの観戦記録 - ポストマッチ' />
      </Helmet>

      <>
      <div className='bg'></div>
      <div className='container'>
        <h2 className='container-title'>みんなの観戦記録を見てみよう</h2>
        { isLoading && !data ? (
          <SkeletonScreenPost />
        ) : (
          <PostList
            data={data}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            ignitionPage={ignitionPage}
          />
        )}
      </div>
      </>
    </>
  )
}

export default Posts;