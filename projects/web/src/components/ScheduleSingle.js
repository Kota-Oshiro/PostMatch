import React, { useState, useEffect, useContext, useRef, createContext } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { AuthContext } from '../AuthContext';

import './Schedule.css';

import { SkeletonScreenScheduleList } from './Loader';

import ScheduleCard from './ScheduleCard';
import ScheduleTab from './ScheduleTab';
import ScoreVisibleSwitcher from './ScoreVisibleSwitcher';
import NotFoundPage from './error/NotFoundPage';

import { getSingleCompetitionId, getCompetitionName, getCompetitionColor, getCompetitionIcon } from './UtilityCompetition';

export const FetchContext = createContext();

function ScheduleSingle() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();

  const queryClient = useQueryClient();

  const { apiBaseUrl } = useContext(AuthContext);

  // 初回レンダリング
  const [isInitialRender, setIsInitialRender] = useState(true);

  const competitionCode = (id);
  const competitionId = getSingleCompetitionId(competitionCode);
  const competitionName = getCompetitionName(competitionId);
  const competitionColor = getCompetitionColor(competitionId);
  const CompetitionIcon = getCompetitionIcon(competitionId);

  const [seasonYear, setseasonYear] = useState(2023);

  const minTab = 1;
  const getMaxTab = (id) => {
    switch(id) {
      case 2119:
        return 34;
      case 2001:
        return 13;
      default:
        return 38;
    }
  }
  const maxTab = getMaxTab(competitionId);

  // スケジュールタブ用のマッチデイとuseRefで前後記録
  const [tabMatchday, setTabMatchday] = useState(null);
  const prevTabMatchdayRef = useRef(tabMatchday);

  // APIリクエスト用のマッチデイ
  const [fetchedMatchday, setFetchedMatchday] = useState(null);
  const prevFetchedMatchdayRef = useRef(fetchedMatchday);

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
  
  const NotFetchedMatchday = !MatchdayStateSame;

  const queryKey = ['matches', competitionId, seasonYear, fetchedMatchday];

  useEffect(() => {
    
    if (!isCached(queryKey)) {
      if (isInitialRender) {
        setLoading(true);
      } else {
        setLoadingSchedule(true);
      }
    }
  
  }, [competitionId, fetchedMatchday]);

  // fetch用のURL生成
  const getUrlForMatchday = (competitionId, seasonYear, matchday) => {
    let baseUrl = `/schedule/${competitionId}/${seasonYear}/`;
  
    if (competitionId === 2001) {
      if (!matchday) {
        return baseUrl;
      }
      switch (matchday) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
          return `${baseUrl}?stage=GROUP_STAGE&matchday=${matchday}`;
        case 7:
          return `${baseUrl}?stage=LAST_16&matchday=1`;
        case 8:
          return `${baseUrl}?stage=LAST_16&matchday=2`;
        case 9:
          return `${baseUrl}?stage=QUARTER_FINALS&matchday=1`;
        case 10:
          return `${baseUrl}?stage=QUARTER_FINALS&matchday=2`;
        case 11:
          return `${baseUrl}?stage=SEMI_FINALS&matchday=1`;
        case 12:
          return `${baseUrl}?stage=SEMI_FINALS&matchday=2`;
        case 13:
          return `${baseUrl}?stage=FINAL`;
        default:
          return `${baseUrl}?matchday=${matchday}`;
      }      
    } else if (matchday) {
      return `${baseUrl}?matchday=${matchday}`;
    } else {
      return `${baseUrl}`;
    }
  }

  // tabセット用
  const determineTabMatchday = (stage, matchday) => {
    if (stage === 'LAST_16') {
      return matchday === 1 ? 7 : 8;
    } else if (stage === 'QUARTER_FINALS') {
      return matchday === 1 ? 9 : 10;
    } else if (stage === 'SEMI_FINALS') {
      return matchday === 1 ? 11 : 12;
    } else if (stage === 'FINAL') {
      return 13;
    }
    return matchday;
  };
    
  const fetchMatches = async (competitionId, seasonYear, matchday) => {
    const url = getUrlForMatchday(competitionId, seasonYear, matchday);
    const result = await apiBaseUrl.get(url);
    return result.data;
  };

  const { data: matchesData, isError, error } = useQuery(
    queryKey, 
    () => fetchMatches(competitionId, seasonYear, NotFetchedMatchday ? null : fetchedMatchday), 
    {
      onSuccess: (data) => {
        setLoading(false);
        setLoadingSchedule(false);
        if (data.length > 0 && (isInitialRender || !TabMatchdayChangedFirst) || competitionId === 2001) {
          const tabMatchday = determineTabMatchday(data[0].stage, data[0].matchday);
          setTabMatchday(tabMatchday);
          if (data.length > 0 && (isInitialRender || !TabMatchdayChangedFirst)) {
            setIsInitialRender(false);
          } else {
            setFetchedMatchday(tabMatchday);
          }
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

  prevTabMatchdayRef.current = tabMatchday;
  prevFetchedMatchdayRef.current = fetchedMatchday;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (matchesData.length > 0) {
        const newMatchday = Math.min(tabMatchday + 1, maxTab);
        setTabMatchday(newMatchday);
        setFetchedMatchday(newMatchday);
      }
    },
    onSwipedRight: () => {
      if (matchesData.length > 0) {
        const newMatchday = Math.max(tabMatchday - 1, minTab);
        setTabMatchday(newMatchday);
        setFetchedMatchday(newMatchday);
      }
    }
  });

  // UIでgroup名で日本語変換する（UCL用）
  const getGroupLabel = (groupKey) => {
    const groupNumber = groupKey.split('_')[1];
    return `グループ${groupNumber}`;
  };

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
                    <div className='league-header league-select-schedule'>
                      <div>
                        <div className='league-name'>
                          <CompetitionIcon className='league-icon' />
                          <h2 className='league-text'>{competitionName}</h2>
                        </div>
                      </div>
                    </div>
                    <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
                  </div>
                  <ScheduleTab competitionId={competitionId} tabMatchday={tabMatchday} setTabMatchday={setTabMatchday} setFetchedMatchday={setFetchedMatchday} minTab={minTab} maxTab={maxTab} />
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
                    <div className='league-header league-select-schedule'>
                      <div>
                        <div className='league-name'>
                          <CompetitionIcon className='league-icon' />
                          <h2 className='league-text'>{competitionName}</h2>
                        </div>
                      </div>
                    </div>
                    <ScoreVisibleSwitcher isScoreVisible={isScoreVisible} setScoreVisible={setScoreVisible} />
                  </div>
                  <ScheduleTab competitionId={competitionId} tabMatchday={tabMatchday} setTabMatchday={setTabMatchday} setFetchedMatchday={setFetchedMatchday} minTab={minTab} maxTab={maxTab} />
                </div>
                <div {...handlers} className={`schedule-cards ${competitionId === 2119 ? 'schedule-cards-jleague' : ''}`}>
                  {isLoadingSchedule ? (
                    <SkeletonScreenScheduleList />
                  ) : (
                    // uclのときのgroup化処理
                    competitionId === 2001 && matchesData && matchesData.length > 0 && matchesData[0].stage === "GROUP_STAGE" ? (
                      Object.entries(
                        matchesData.reduce((acc, match) => {
                          (acc[match.group] = acc[match.group] || []).push(match);
                          return acc;
                        }, {})
                      ).map(([group, matches]) => (
                        <div key={group}>
                          <h2 className='schedule-group-title'>{getGroupLabel(group)}</h2>
                          {matches.map((match, i) => (
                            <ScheduleCard
                              key={match.id}
                              match={match}
                              isScoreVisible={isScoreVisible}
                              competitionId={competitionId}
                              // isFirst={i === 0}
                              isLast={i === matches.length - 1}
                            />
                          ))}
                        </div>
                        ))
                      ) : (
                          matchesData && matchesData.map((match, i) => (
                              <ScheduleCard
                                  key={match.id}
                                  match={match}
                                  isScoreVisible={isScoreVisible}
                                  competitionId={competitionId}
                                  isFirst={i === 0 && match.stage !== 'FINAL'}
                                  isLast={i === matchesData.length - 1 && match.stage !== 'FINAL'}
                                  isSingle={match.stage === 'FINAL'}
                              />
                          ))
                      )
                  )}
                </div>
              </div>
            </div>
          )}
      </FetchContext.Provider>

      </div>
        
    </>
  );
}
  
export default ScheduleSingle;
