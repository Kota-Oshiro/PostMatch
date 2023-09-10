import React, { useState, useEffect, useContext, useRef, createContext, Suspense } from 'react';
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

import { getDefaultCompetitionId,getCompetitionName, getCompetitionColor, getCompetitionIcon } from './UtilityCompetition';

const MatchCardListNational = React.lazy(() => import('./MatchCardListNational.js'));

export const FetchContext = createContext();

function Schedule() {  

  const queryClient = useQueryClient();

  const { currentUser, apiBaseUrl } = useContext(AuthContext);

  // 初回レンダリング
  const [isInitialRender, setIsInitialRender] = useState(true);

  const initialCompetitionId = getDefaultCompetitionId(currentUser);
  const initialCompetitionName = getCompetitionName(initialCompetitionId);
  const initialCompetitionColor = getCompetitionColor(initialCompetitionId);
  const initialCompetitionIcon = getCompetitionIcon(initialCompetitionId);

  const [competitionId, setCompetitionId] = useState(initialCompetitionId);
  // competitonIdが変わったときにisLoadingをtrueにするために使用
  const prevCompetitionIdRef = useRef(competitionId);

  const [seasonYear, setseasonYear] = useState(2023);

  const [competitionIcon, setCompetitionIcon] = useState(initialCompetitionIcon);
  const [competitionName, setCompetitionName] = useState(initialCompetitionName);
  const [competitionColor, setCompetitionColor] = useState(initialCompetitionColor);

  const minTab = 1;
  const maxTab = competitionId === 2119 ? 34 : 38;

  // スケジュールタブ用のマッチデイとuseRefで前後記録
  const [tabMatchday, setTabMatchday] = useState(null);
  const prevTabMatchdayRef = useRef(tabMatchday);

  // APIリクエスト用のマッチデイ
  const [fetchedMatchday, setFetchedMatchday] = useState(null);
  const prevFetchedMatchdayRef = useRef(fetchedMatchday);

  const [isLeagueSelectModalVisible, setLeagueSelectModalVisible] = useState(false);
  const [isScoreVisible, setScoreVisible] = useState(false);

  // グローバルのローディング
  const [isLoading, setLoading] = useState(true);
  // ローカルのローディング（scheduleList）
  const [isLoadingSchedule, setLoadingSchedule] = useState(false);

  // fetchMatchesがキャッシュされていればtrue、そうでなければfalseを返す
  const isCached = (key) => {
    return !!queryClient.getQueryData(key);
  }

  // 1. 初回レンダリング時はfetched_matchdayをセットせず、tab_matchdayのみセットするので、始めてのmatchdayタブ変更は両者のcurrentが異なる状態となる
  const MatchdayStateDefault = prevTabMatchdayRef.current !==  prevFetchedMatchdayRef.current;
  // 2. 始めてのmatchdayタブ変更はfetched_matchdayがnullから非nullとなる
  const fetchedMatchdayNullToNonNull = prevFetchedMatchdayRef.current == null && fetchedMatchday !== null;
  // 1 + 2 （初回レンダリング後に始めてtab_matchdayを変更した）
  const TabMatchdayChangedFirst = MatchdayStateDefault && fetchedMatchdayNullToNonNull
  
  // 両matchdayのstateが同じ状態
  const MatchdayStateSame = tabMatchday === fetchedMatchday;
  // competition_idの変更
  const competitionChanged = prevCompetitionIdRef.current !== competitionId;
  
  const NotFetchedMatchday = !MatchdayStateSame || competitionChanged;

  const queryKey = ['matches', competitionId, seasonYear, fetchedMatchday];

  useEffect(() => {
    
    if (!isCached(queryKey)) {
      if (isInitialRender || competitionChanged) {
        setLoading(true);
      } else {
        setLoadingSchedule(true);
      }
    }
  
  }, [competitionId, fetchedMatchday]);

  const fetchMatches = async (competitionId, seasonYear, matchday) => {
    const url = matchday
        ? `/schedule/${competitionId}/${seasonYear}/${matchday}`
        : `/schedule/${competitionId}/${seasonYear}/`;
    const result = await apiBaseUrl.get(url);
    return result.data;
  };

  const { data: matchesData } = useQuery(
    queryKey, 
    () => fetchMatches(competitionId, seasonYear, NotFetchedMatchday ? null : fetchedMatchday), 
    {
      onSuccess: (data) => {
        setLoading(false);
        setLoadingSchedule(false);   
        if (data.length > 0 && (isInitialRender || competitionChanged || !TabMatchdayChangedFirst)) {
          setTabMatchday(data[0].matchday);
          setIsInitialRender(false);
        } else {
          setTabMatchday(data[0].matchday);
          setFetchedMatchday(data[0].matchday);
        }
      },
      onError: () => {
        setLoading(false);
        setLoadingSchedule(false);
      },
    }
  );

  prevCompetitionIdRef.current = competitionId;
  prevTabMatchdayRef.current = tabMatchday;
  prevFetchedMatchdayRef.current = fetchedMatchday;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (matchesData.length > 0) {
        const newMatchday = Math.min(fetchedMatchday + 1, maxTab);
        setFetchedMatchday(newMatchday);
      }
    },
    onSwipedRight: () => {
      if (matchesData.length > 0) {
        const newMatchday = Math.max(fetchedMatchday - 1, minTab);
        setFetchedMatchday(newMatchday);
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
              <div className='content-bg' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)`}} >
                <div className='schedule-header'>
                  <div className='schedule-league'>
                    <LeagueSelecter
                      isLeagueSelectModalVisible={isLeagueSelectModalVisible}
                      setLeagueSelectModalVisible={setLeagueSelectModalVisible}
                      competitionId={competitionId}
                      setCompetitionId={setCompetitionId}
                      competitionIcon={competitionIcon}
                      setCompetitionIcon={setCompetitionIcon}
                      competitionName={competitionName}
                      setCompetitionName={setCompetitionName}
                      setCompetitionColor={setCompetitionColor}
                    />
                    <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
                  </div>
                  <ScheduleTab tabMatchday={tabMatchday} setTabMatchday={setTabMatchday} setFetchedMatchday={setFetchedMatchday} minTab={minTab} maxTab={maxTab} />
                </div>
                <div className= 'schedule-cards'>
                  <SkeletonScreenScheduleList />
                </div>
              </div>
            </div>
          ) : (
            <div className='schedule-container'>
              <div className='content-bg' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)`}} >
                <div className='schedule-header'>
                  <div className='schedule-league'>
                      <LeagueSelecter
                          isLeagueSelectModalVisible={isLeagueSelectModalVisible}
                          setLeagueSelectModalVisible={setLeagueSelectModalVisible}
                          competitionId={competitionId}
                          setCompetitionId={setCompetitionId}
                          competitionIcon={competitionIcon}
                          setCompetitionIcon={setCompetitionIcon}
                          competitionName={competitionName}
                          setCompetitionName={setCompetitionName}
                          setCompetitionColor={setCompetitionColor}
                      />
                      <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
                  </div>
                  <ScheduleTab tabMatchday={tabMatchday} setTabMatchday={setTabMatchday} setFetchedMatchday={setFetchedMatchday} minTab={minTab} maxTab={maxTab} />
                </div>
                <div {...handlers} className={`schedule-cards ${competitionId === 2119 ? 'schedule-cards-jleague' : ''}`}>
                    {isLoadingSchedule ? (
                        <SkeletonScreenScheduleList />
                    ) : (
                        matchesData && matchesData.map((match, i) => (
                          <ScheduleCard
                            key={match.id}
                            match={match}
                            isScoreVisible={isScoreVisible}
                            competitionId={competitionId}
                            isFirst={i === 0}
                            isLast={i === matchesData.length - 1}
                          />
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
