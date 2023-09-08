import React from 'react';
import { useLocation } from 'react-router-dom';

import { Loader, LoaderSpinner } from './Loader';

import ScheduleCard from './ScheduleCard';
import NoContent from './NoContent';

function ScheduleList({ data, isLoading, isFetchingNextPage, ignitionPage }) {

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
            <div key={i}>
              {pageData.results.map(watch => (
                <ScheduleCard key={watch.id} match={watch.match} />
              ))}
            </div>
          ))}
        </>
      )}
      {isFetchingNextPage && <LoaderSpinner />}
      <div ref={ignitionPage} style={{ height: '24px' }} />
    </>
  );
}

export default ScheduleList;