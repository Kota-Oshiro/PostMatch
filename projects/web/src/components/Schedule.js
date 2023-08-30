import React, { useState, useEffect, useContext, createContext } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';

import { AuthContext } from '../AuthContext';

import './Schedule.css';

import { SkeletonScreenSchedule, SkeletonScreenScheduleList } from './Loader';

import ScheduleCard from './ScheduleCard';
import ScheduleTab from './ScheduleTab';
import LeagueSelecter from './LeagueSelecter';
import ScoreVisibleSwitcher from './ScoreVisibleSwitcher';

import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';

export const FetchContext = createContext();

function Schedule() {  

  const queryClient = useQueryClient();

  const { currentUser } = useContext(AuthContext);

  const initialCompetitionId = currentUser && currentUser.support_team_competition ? currentUser.support_team_competition : 2021;
  const initialSeasonId = currentUser && currentUser.support_team_season ? currentUser.support_team_season : 1564;
  const initialCompetitionName = initialCompetitionId === 2021 ? 'プレミアリーグ' 
    : initialCompetitionId === 2014 ? 'ラ・リーガ' 
    : initialCompetitionId === 2019 ? 'セリエA'
    : 'スケジュール';
  const initialCompetitionColor = initialCompetitionId === 2021 ? '#38003c' 
    : initialCompetitionId === 2014 ? '#FF4B44' 
    : initialCompetitionId === 2019 ? '#171D8D'
    : '#3465FF';
    const initialCompetitionIcon = initialCompetitionId === 2021 ? NationEngIcon
    : initialCompetitionId === 2014 ? NationEspIcon 
    : initialCompetitionId === 2019 ? NationItaIcon
    : NationEngIcon;

  const [competitionId, setCompetitionId] = useState(initialCompetitionId);
  // competitonIdが変わったときにisLoadingをtrueにするために使用
  const [prevCompetitionId, setPrevCompetitionId] = useState(null);

  const [seasonId, setSeasonId] = useState(initialSeasonId);

  const [competitionIcon, setCompetitionIcon] = useState(initialCompetitionIcon);
  const [competitionName, setCompetitionName] = useState(initialCompetitionName);
  const [competitionColor, setCompetitionColor] = useState(initialCompetitionColor);

  const minTab = 1;
  const maxTab = 38;

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

  const fetchMatches = async (competitionId, seasonId, matchday) => {
    const url = matchday 
      ? `${process.env.REACT_APP_API_BASE_URL}/schedule/${competitionId}/${seasonId}/${matchday}` 
      : `${process.env.REACT_APP_API_BASE_URL}/schedule/${competitionId}/${seasonId}/`;
    const result = await axios.get(url);
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

  return (
    <>
      <Helmet>
        <title>{competitionName}の試合日程 - ポストマッチ</title>
        <meta property='og:title' content={`${competitionName}の試合日程 - ポストマッチ`} />
      </Helmet>

      <FetchContext.Provider value={{ fetchMatches, isLoading, setLoadingSchedule }}>
        <div className='bg'></div>
        {isLoading ? (
          <SkeletonScreenSchedule />
        ) : (
        <>
        <div className='schedule-container'>
          <div className='schedule-header' style={{ backgroundColor: competitionColor }}>
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
            <ScheduleTab currentMatchday={currentMatchday} setCurrentMatchday={setCurrentMatchday} />
          </div>
          <div {...handlers}>
            {isLoadingSchedule ? (
              <SkeletonScreenScheduleList />
            ) : (
              matchesData && matchesData.map(match => (
                <ScheduleCard key={match.id} match={match} isScoreVisible={isScoreVisible} />
              ))
            )}
          </div>
        </div>
        </>
        )}
      </FetchContext.Provider>
    </>
  );
}
  
export default Schedule;
