import React, { useEffect } from 'react';

import { Loader, LoaderInContent } from './Loader';

import ScheduleCard from './ScheduleCard';

function ScheduleList({ data, isLoading, isFetchingNextPage, ignitionPage }) {
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
      {isFetchingNextPage && <LoaderInContent />}
      <div ref={ignitionPage} style={{ height: '20px' }} />
    </>
  );
}

export default ScheduleList;