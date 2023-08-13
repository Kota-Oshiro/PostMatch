import React, { useState, useEffect, createContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';

import './Schedule.css';
import { ReactComponent as NaitonEngIcon } from '../icons/nation_eng.svg';

import { SkeletonScreenSchedule, SkeletonScreenScheduleList } from './Loader';

import ScheduleCard from './ScheduleCard';
import ScheduleTab from './ScheduleTab';
import ScoreVisibleSwitcher from './ScoreVisibleSwitcher'

export const FetchContext = createContext();

function Schedule() {  

  const { competition_id, season_id } = useParams();

  const [isLoading, setLoading] = useState(true);
  const [isLoadingTab, setLoadingTab] = useState(false);
  
  const [matches, setMatches] = useState([]);

  const [isScoreVisible, setScoreVisible] = useState(false);

  const [competition, setCompetition] = useState(competition_id);
  const [season, setSeason] = useState(season_id);

  const [currentMatchday, setCurrentMatchday] = useState(null);

  const minTab = 1;
  const maxTab = 38;

  //フェッチデータ
  const fetchData = async (matchday) => {
    setLoadingTab(true);
    const url = matchday 
      ? `${process.env.REACT_APP_API_BASE_URL}/schedule/${competition}/${season}/${matchday}` 
      : `${process.env.REACT_APP_API_BASE_URL}/schedule/${competition}/${season}/`;
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
  }, []);

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
        <title>イングランドプレミアリーグの試合日程 - ポストマッチ</title>
        <meta property='og:title' content='イングランドプレミアリーグの試合日程 - ポストマッチ' />
      </Helmet>

      <FetchContext.Provider value={{ fetchData, setLoading, setLoadingTab }}>
        <div className='bg'></div>
        {isLoading ? (
          <SkeletonScreenSchedule />
        ) : (
        <>
        <div className='schedule-container'>
          <div className='schedule-header'>
            <div className='schedule-league'>
              <div className='schedule-league-name'>
                <NaitonEngIcon className='schedule-league-img' />
                <h2 className='schedule-header-text'>プレミアリーグ</h2>
              </div>
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
