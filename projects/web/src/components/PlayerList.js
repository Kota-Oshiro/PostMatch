import React, { useEffect } from 'react';

import { Loader, LoaderInContent } from './Loader';

import PlayerCard from './PlayerCard';

function PlayerList({ data, isLoading, isFetchingNextPage, ignitionPage }) {
  
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
      {isFetchingNextPage && <LoaderInContent />}
      <div ref={ignitionPage} style={{ height: '20px' }} />
    </>
  );
}

export default PlayerList;