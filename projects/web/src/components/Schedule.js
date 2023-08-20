import React, { useState, useEffect, useContext, createContext } from 'react';
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
  const [seasonId, setSeasonId] = useState(initialSeasonId);

  const [competitionIcon, setCompetitionIcon] = useState(initialCompetitionIcon);
  const [competitionName, setCompetitionName] = useState(initialCompetitionName);
  const [competitionColor, setCompetitionColor] = useState(initialCompetitionColor);

  const [isLoading, setLoading] = useState(true);
  const [isLoadingTab, setLoadingTab] = useState(false);
  
  const [matches, setMatches] = useState([]);

  const [isLeagueSelectModalVisible, setLeagueSelectModalVisible] = useState(false);
  const [isScoreVisible, setScoreVisible] = useState(false);

  const [currentMatchday, setCurrentMatchday] = useState(null);

  const minTab = 1;
  const maxTab = 38;

  //フェッチデータ
  const fetchData = async (matchday) => {
    setLoadingTab(true);
    const url = matchday 
      ? `${process.env.REACT_APP_API_BASE_URL}/schedule/${competitionId}/${seasonId}/${matchday}` 
      : `${process.env.REACT_APP_API_BASE_URL}/schedule/${competitionId}/${seasonId}/`;
    const result = await axios.get(url);
    setMatches(result.data);
    setLoadingTab(false);
    return result.data;
  };

  //初回レンダリング フェッチ後にcurrentMatchdayを設定
  useEffect(() => {
    const fetchDataAndUpdateLoading = async () => {
      const matchesData = await fetchData();
      if (matchesData.length > 0) { 
        setCurrentMatchday(matchesData[0].matchday);
      }
      setLoading(false);
    };
    fetchDataAndUpdateLoading();
  }, [competitionId, setCompetitionId]);

  //スワイプしたらフェッチとcurrentMatchdayの更新
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (matches.length > 0) {
        const newMatchday = Math.min(currentMatchday + 1, maxTab);
        setCurrentMatchday(newMatchday);
        fetchData(newMatchday);
      }
    },
    onSwipedRight: () => {
      if (matches.length > 0) {
        const newMatchday = Math.max(currentMatchday - 1, minTab);
        setCurrentMatchday(newMatchday);
        fetchData(newMatchday);
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>{competitionName}の試合日程 - ポストマッチ</title>
        <meta property='og:title' content={`${competitionName}の試合日程 - ポストマッチ`} />
      </Helmet>

      <FetchContext.Provider value={{ fetchData, setLoading, setLoadingTab }}>
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
            {isLoadingTab ? <SkeletonScreenScheduleList /> : matches.map(match => (
            <ScheduleCard key={match.id} match={match} isScoreVisible={isScoreVisible} />
          ))}
          </div>
        </div>
        </>
        )}
      </FetchContext.Provider>
    </>
  );
}
  
export default Schedule;
