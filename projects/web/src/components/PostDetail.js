import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import { Helmet } from 'react-helmet';

import axios from 'axios';

import { Loader } from './Loader';

import PostCard from './PostCard';
import NotFoundPage from './error/NotFoundPage';

function Posts() {

  const { id } = useParams();

  // 初期レンダリング
  const fetchPost = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/post/${id}/`);
    return res.data;
  };

  const { data, isLoading, isError, error } = useQuery(['post', id], fetchPost, {
    retry: 0,
  });

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
        <title>{data.match.home_team.name_ja} vs {data.match.away_team.name_ja}のポスト（{data.user.name}） - ポストマッチ</title>
        <meta property='og:title' content={`${data.match.home_team.name_ja} vs ${data.match.away_team.name_ja}のポスト（${data.user.name}） - ポストマッチ`} />
      </Helmet>

      <div className='bg'></div>
      <div className='container'>
        <PostCard post={data}/>
      </div>
    </>
  )
}

export default Posts;