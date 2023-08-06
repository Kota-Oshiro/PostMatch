import React from 'react';

import { SkeletonScreenPost, LoaderSpinner } from './Loader';

import PostCard from './PostCard';
import NoContent from './NoContent';

function PostList({ data, isLoading, isFetchingNextPage, ignitionPage }) {

  const totalCount = data?.pages.reduce((sum, page) => sum + page.results.length, 0);
  
  if (totalCount === 0 && !isLoading) {
    return (
      <NoContent />
    )
  }

  return (
    <>
      {isLoading ? (
        <SkeletonScreenPost />
      ) : (
        <>
          {data.pages.map((pageData, i) => (
            <div key={i} className='posts'>
              {pageData.results.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ))}
        </>
      )}
      {isFetchingNextPage && <LoaderSpinner />}
      <div ref={ignitionPage} style={{ height: '1px' }} />
    </>
  );
}

export default PostList;
