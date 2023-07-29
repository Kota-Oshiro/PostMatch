import React from 'react';
import { Link } from 'react-router-dom';

import { Loader, LoaderInContent } from './Loader';

import './SupporterList.css';

function SupporterList({ data, isLoading, isFetchingNextPage, ignitionPage }) {

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
      {isFetchingNextPage && <LoaderInContent />}
      <div ref={ignitionPage} style={{ height: '20px' }} />
    </>
  );
}

export default SupporterList;