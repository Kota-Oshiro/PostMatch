import React from 'react';
import { useLocation } from 'react-router-dom';

import { Loader, LoaderSpinner } from './Loader';

import ScheduleCard from './ScheduleCard';
import NoContent from './NoContent';

function ScheduleList({ data, isLoading, isFetchingNextPage, ignitionPage, fromComponent }) {

  const totalCount = data?.pages.reduce((sum, page) => sum + page.results.length, 0);

  // ScheduleTeamとUserDetailでレスポンス構造が異なるので子要素へのpropsを分岐
  const matchDataSelector = (match) => {
    if (fromComponent === "ScheduleTeam") {
      return match;
    }
    return match.match;
  }
  
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
          {data.pages.map((pageData, pageIndex) => (
            <div key={pageIndex}>
              {pageData.results.map((match, matchIndex) => {
                const selectedMatch = matchDataSelector(match);
                return (
                  <ScheduleCard
                    key={match.id}
                    match={selectedMatch}
                    isFirst={matchIndex === 0 && selectedMatch.stage !== 'FINAL'}
                    isLast={matchIndex === pageData.results.length - 1 && selectedMatch.stage !== 'FINAL'}
                  />
                );
              })}
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

export default ScheduleList;