import React from 'react';
import { Link } from 'react-router-dom';

import { Loader, LoaderSpinner } from './Loader';

import './SupporterList.css';
import NoContent from './NoContent';

function SupporterList({ data, isLoading, isFetchingNextPage, ignitionPage }) {

  const totalCount = data?.pages.reduce((sum, page) => sum + page.results.length, 0);
  
  if (totalCount === 0 && !isLoading) {
    return (
      <NoContent />
    )
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {data.pages.map((pageData, i) => (
            <div key={`page-${i}`} className='supporters'>
              {pageData.results.map(user => (
                <Link key={user.id} to={`/user/${user.id}`} className='supporter-link' >
                <img 
                  src={user.profile_image} 
                  className='supporter-profile-img' 
                  alt={user.name}
                />
                </Link>
              ))}
            </div>
          ))}
        </>
      )}
      {isFetchingNextPage ? (
        <LoaderSpinner />
      ) : (
        <div ref={ignitionPage} style={{ height: '24px' }} />
      )}
    </>
  );
}

export default SupporterList;