import React from 'react';

import { Loader, LoaderInContent } from './Loader';

import PostCard from './PostCard';

function PostList({ data, isLoading, isFetchingNextPage, ignitionPage }) {
  return (
    <>
      {isLoading ? (
        <Loader />
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
      {isFetchingNextPage && <LoaderInContent />}
      <div ref={ignitionPage} style={{ height: '1px' }} />
    </>
  );
}

export default PostList;
