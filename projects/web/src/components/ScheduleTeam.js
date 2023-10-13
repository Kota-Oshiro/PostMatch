import React, { useState, useEffect, useContext, useRef, createContext } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import axios from 'axios';

import './Schedule.css';

import { SkeletonScreenScheduleList } from './Loader';

import ScheduleList from './ScheduleList';
import ScoreVisibleSwitcher from './ScoreVisibleSwitcher';
import NotFoundPage from './error/NotFoundPage';

import { getTeamId, getTeamName, getTeamIcon, getTeamColor } from '../Utility';

function ScheduleTeam() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();

  const TeamCode = (id);
  const TeamId = getTeamId(TeamCode);
  const TeamName = getTeamName(TeamId);
  const TeamColor = getTeamColor(TeamId);
  const TeamIcon = getTeamIcon(TeamId);

  const [isScoreVisible, setScoreVisible] = useState(false);
   
  const sourceRef = useRef(axios.CancelToken.source());

  const fetchMatches = async ({ pageParam = 1 }) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/schedule/team/${TeamId}/?page=${pageParam}`, {
      cancelToken: sourceRef.current.token
    });
    return res.data;
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(['matches', id], fetchMatches, {
    staleTime: Infinity,
    getNextPageParam: (lastPage) => {
      if (lastPage.next !== null) {
        const nextPageUrl = new URL(lastPage.next);
        return nextPageUrl.searchParams.get('page');
      }
    },
  });

  const observer = useRef(null)

  const ignitionPage = useRef(null);

  useEffect(() => {
    const observerCallback = entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
  
    if (!observer.current) {
      observer.current = new IntersectionObserver(observerCallback, { threshold: 1 });
    } else {
      observer.current.disconnect();  // Disconnect first
      observer.current = new IntersectionObserver(observerCallback, { threshold: 1 });  // Then re-assign
    }
  
    if (!isLoading && !isError && ignitionPage.current) {
      observer.current.observe(ignitionPage.current);
    }
  
    return () => {
      try {
        sourceRef.current.cancel("Operation cancelled by user.");
      } catch (cancelError) {
        console.error("Error cancelling:", cancelError);
      }
      sourceRef.current = axios.CancelToken.source();
  
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [data, isLoading, ignitionPage, hasNextPage, fetchNextPage]);



  if (isError) {
    return(
      <>
        <div className='bg'></div>      
        <NotFoundPage />
      </>
    )
  }

  return (
    <>
      <Helmet>
          <title>{TeamName}の試合日程 - ポストマッチ</title>
          <meta property='og:title' content={`${TeamName}の試合日程 - ポストマッチ`} />
      </Helmet>

      <div className='bg'></div>

      <div className='schedule-wrapper'>

        <div className='schedule-container'>
          <div className='content-bg' style={{backgroundImage: `linear-gradient(${TeamColor}, #f7f7f7 360px)`}} >
            <div className='schedule-header'>
              <div className='schedule-league'>
                <div className='league-header league-header-single'>
                  <div>
                    <div className='league-name'>
                      <TeamIcon className='league-icon' />
                      <h2 className='league-text'>{TeamName}</h2>
                    </div>
                  </div>
                </div>
                <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
              </div>
            </div>
            <div className= 'schedule-cards'>
              {isLoading ? (
                <SkeletonScreenScheduleList />
              ) : (
                <ScheduleList
                data={data}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                ignitionPage={ignitionPage}
                fromComponent='ScheduleTeam'
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
  
export default ScheduleTeam;
