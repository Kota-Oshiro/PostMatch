import React, { useEffect } from 'react';

import { Loader, LoaderSpinner } from './Loader';

import PlayerCard from './PlayerCard';
import NoContent from './NoContent';

function PlayerList({ data, dataMatch, isLoading, isFetchingNextPage, ignitionPage }) {
  
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
              {pageData.results.map(player => (
                <PlayerCard key={player.id} player={player} dataMatch={dataMatch} />
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

export default PlayerList;