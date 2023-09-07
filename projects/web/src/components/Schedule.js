import React, { useState, useEffect, useContext, createContext, Suspense } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';

import { AuthContext } from '../AuthContext';

import './Schedule.css';

import { SkeletonScreenScheduleList, SkeletonMatchCardList } from './Loader';

import ScheduleCard from './ScheduleCard';
import ScheduleTab from './ScheduleTab';
import LeagueSelecter from './LeagueSelecter';
import ScoreVisibleSwitcher from './ScoreVisibleSwitcher';
import NotFoundPage from './error/NotFoundPage';

import { getDefaultCompetitionId, getDefaultSeasonId,getCompetitionName, getCompetitionColor, getCompetitionIcon } from './UtilityCompetition';

const MatchCardListNational = React.lazy(() => import('./MatchCardListNational.js'));

export const FetchContext = createContext();

function Schedule() {  

  const queryClient = useQueryClient();

  const { currentUser, apiBaseUrl } = useContext(AuthContext);

  const initialCompetitionId = getDefaultCompetitionId(currentUser);
  const initialSeasonId = getDefaultSeasonId(currentUser);
  
  const initialCompetitionName = getCompetitionName(initialCompetitionId);
  const initialCompetitionColor = getCompetitionColor(initialCompetitionId);
  const initialCompetitionIcon = getCompetitionIcon(initialCompetitionId);

  const [competitionId, setCompetitionId] = useState(initialCompetitionId);
  // competitonIdが変わったときにisLoadingをtrueにするために使用
  const [prevCompetitionId, setPrevCompetitionId] = useState(initialCompetitionId);

  const [seasonId, setSeasonId] = useState(initialSeasonId);

  const [competitionIcon, setCompetitionIcon] = useState(initialCompetitionIcon);
  const [competitionName, setCompetitionName] = useState(initialCompetitionName);
  const [competitionColor, setCompetitionColor] = useState(initialCompetitionColor);

  const minTab = 1;
  const maxTab = competitionId === 2119 ? 34 : 38;

  const [currentMatchday, setCurrentMatchday] = useState(null);

  const [isLeagueSelectModalVisible, setLeagueSelectModalVisible] = useState(false);
  const [isScoreVisible, setScoreVisible] = useState(false);

  // 初回レンダリングの判定
  const [isInitialRender, setIsInitialRender] = useState(true);

  // グローバルのローディング
  const [isLoading, setLoading] = useState(true);

  // ローカルのローディング（scheduleList）
  const [isLoadingSchedule, setLoadingSchedule] = useState(false);

  // fetchMatchesがキャッシュされていればtrue、そうでなければfalseを返す
  const isCached = (key) => {
    return !!queryClient.getQueryData(key);
  }

  const queryKey = ['matches', competitionId, seasonId, currentMatchday];

  // queryKeyがなく新規フェッチで初回レンダリングまたはcompetitionIdが変わったときにsetLoading（グローバルローディング）を表示し、それ以外はsetLoadingScheduleを表示
  useEffect(() => {
    if (!isCached(queryKey)) {
      if (isInitialRender || prevCompetitionId !== competitionId) {
        setLoading(true);
      } else {
        setLoadingSchedule(true);
      }
      setPrevCompetitionId(competitionId);
    }
  }, [competitionId, currentMatchday]);

  // competitionIdが変わったときにcurrentMatchdayをリセット
  useEffect(() => {
    if (prevCompetitionId !== null && competitionId !== prevCompetitionId) {
      setCurrentMatchday(null);
    }
  }, [competitionId]);

  const fetchMatches = async (competitionId, seasonId, matchday) => {
    const url = matchday 
        ? `/schedule/${competitionId}/${seasonId}/${matchday}`
        : `/schedule/${competitionId}/${seasonId}/`;
    const result = await apiBaseUrl.get(url);
    return result.data;
  };
  
  const { data: matchesData } = useQuery(
    queryKey, 
    () => fetchMatches(competitionId, seasonId, currentMatchday), 
    {
      onSuccess: (data) => {
        setLoading(false);
        setLoadingSchedule(false);
        if (data.length > 0 && !currentMatchday) {
          setCurrentMatchday(data[0].matchday);
        }
        if (isInitialRender) {
          setIsInitialRender(false);
        }
      },
      onError: () => {
        setLoading(false);
        setLoadingSchedule(false);
      }
    }
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (matchesData.length > 0) {
        const newMatchday = Math.min(currentMatchday + 1, maxTab);
        setCurrentMatchday(newMatchday);
      }
    },
    onSwipedRight: () => {
      if (matchesData.length > 0) {
        const newMatchday = Math.max(currentMatchday - 1, minTab);
        setCurrentMatchday(newMatchday);
      }
    }
  });

  // NationalMatchListのfetch
  const fetchNationalMatch = async () => {
    const res = await apiBaseUrl.get(`/national_matches/`);
    return res.data;
  };
    
  const { data: matchCardData, isLoading: isLoadingMatchCardList, isError, error } = useQuery(
    ['match'], 
    fetchNationalMatch,
  );

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
          <title>{competitionName}の試合日程 - ポストマッチ</title>
          <meta property='og:title' content={`${competitionName}の試合日程 - ポストマッチ`} />
      </Helmet>

      <div className='bg'></div>

      <div className='schedule-wrapper'>

      <FetchContext.Provider value={{ fetchMatches, isLoading, setLoadingSchedule }}>
          {isLoading ? (
            <div className='schedule-container'>
              <div className='content-bg-narrow' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)`}} >
                <div className='schedule-header'>
                  <div className='schedule-league'>
                    <LeagueSelecter
                      isLeagueSelectModalVisible={isLeagueSelectModalVisible}
                      setLeagueSelectModalVisible={setLeagueSelectModalVisible}
                      competitionId={competitionId}
                      setCompetitionId={setCompetitionId}
                      setSeasonId={setSeasonId}
                      competitionIcon={competitionIcon}
                      setCompetitionIcon={setCompetitionIcon}
                      competitionName={competitionName}
                      setCompetitionName={setCompetitionName}
                      competitionColor={competitionColor}
                      setCompetitionColor={setCompetitionColor}
                    />
                    <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
                  </div>
                  <ScheduleTab currentMatchday={currentMatchday} setCurrentMatchday={setCurrentMatchday} minTab={minTab} maxTab={maxTab} />
                </div>
                <div className= 'schedule-cards'>
                  <SkeletonScreenScheduleList />
                </div>
              </div>
            </div>
          ) : (
            <div className='schedule-container'>
              <div className='content-bg-narrow' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)`}} >
                <div className='schedule-header'>
                  <div className='schedule-league'>
                      <LeagueSelecter
                          isLeagueSelectModalVisible={isLeagueSelectModalVisible}
                          setLeagueSelectModalVisible={setLeagueSelectModalVisible}
                          competitionId={competitionId}
                          setCompetitionId={setCompetitionId}
                          setSeasonId={setSeasonId}
                          competitionIcon={competitionIcon}
                          setCompetitionIcon={setCompetitionIcon}
                          competitionName={competitionName}
                          setCompetitionName={setCompetitionName}
                          competitionColor={competitionColor}
                          setCompetitionColor={setCompetitionColor}
                      />
                      <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
                  </div>
                  <ScheduleTab currentMatchday={currentMatchday} setCurrentMatchday={setCurrentMatchday} minTab={minTab} maxTab={maxTab} />
                </div>
                <div {...handlers} className={`schedule-cards ${competitionId === 2119 ? 'schedule-cards-jleague' : ''}`}>
                    {isLoadingSchedule ? (
                        <SkeletonScreenScheduleList />
                    ) : (
                        matchesData && matchesData.map(match => (
                            <ScheduleCard key={match.id} match={match} isScoreVisible={isScoreVisible} competitionId={competitionId} />
                        ))
                    )}
                </div>
              </div>
            </div>
          )}
      </FetchContext.Provider>

      <Suspense fallback={<SkeletonMatchCardList />}>
        {isLoadingMatchCardList ? (
          <SkeletonMatchCardList />
        ) : (
          matchCardData && <MatchCardListNational data={matchCardData} />
        )}
      </Suspense>

      </div>
        
    </>
  );
}
  
export default Schedule;
