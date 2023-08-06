import React, { useEffect } from 'react';

import { Loader, LoaderSpinner } from './Loader';

import PlayerCard from './PlayerCard';
import NoContent from './NoContent';

function PlayerList({ data, isLoading, isFetchingNextPage, ignitionPage }) {
  
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
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ))}
        </>
      )}
      {isFetchingNextPage && <LoaderSpinner />}
      <div ref={ignitionPage} style={{ height: '20px' }} />
    </>
  );
}

export default PlayerList;