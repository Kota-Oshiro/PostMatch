import React, { useState, useEffect, createContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { Helmet } from 'react-helmet';

import './Schedule.css';

import { Loader } from './Loader';

import ScheduleCard from './ScheduleCard';
import ScheduleTab from './ScheduleTab';

export const FetchContext = createContext();

function Schedule() {  

  const { competition_id, season_id } = useParams();

  const [isLoading, setLoading] = useState(true);
  const [isLoadingTab, setLoadingTab] = useState(false);
  
  const [matches, setMatches] = useState([]);

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
          <Loader />
        ) : (
        <div className='schedule-container'>
          <div className='schedule-header'>
            <div className='schedule-league'>
              <img src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Icon/ENG.webp' className='schedule-league-img' />
              <h2 className='schedule-header-text'>イングランドプレミアリーグ</h2>
            </div>
            <ScheduleTab currentMatchday={currentMatchday} setCurrentMatchday={setCurrentMatchday} />
          </div>
          <div {...handlers}>
            {isLoadingTab ? <Loader /> : matches.map(match => (
            <ScheduleCard key={match.id} match={match} />
          ))}
          </div>
        </div>
        )}
      </FetchContext.Provider>
    </>
  );
}
  
export default Schedule;
