import React, { useState, useContext } from 'react';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet';
import axios from 'axios';

import { AuthContext } from '../AuthContext';

import './TeamList.css';
import { SkeletonScreenTeam } from './Loader';
import TeamCard from './TeamCard';
import LeagueSelecter from './LeagueSelecter';
import NotFoundPage from './error/NotFoundPage';

import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';

function TeamList() {
  
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
  
  const [isLeagueSelectModalVisible, setLeagueSelectModalVisible] = useState(false);

  // teamのフェッチ
  const fetchTeams = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${competitionId}/${seasonId}`);
    return res.data;
  };
  
  const { data, isLoading, isError, error } = useQuery(['team', competitionId, seasonId], fetchTeams, {
    retry: 0,
  });
  
  if (isLoading) {
    return (
      <>
        <div className='bg'></div>
        <div className='team-list-container'>
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
          <SkeletonScreenTeam />
        </div>
      </>
    )
  }

  if (isError) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Helmet>
        <title>{competitionName}のクラブ一覧 - ポストマッチ</title>
        <meta property='og:title' content={`${competitionName}のクラブ一覧 - ポストマッチ`} />
      </Helmet>
      <div className='bg'></div>
      <div className='team-list-container'>
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
        <div className='team-cards'>
        {data && data.map(team => (
          <TeamCard 
            key={team.id} 
            team={team}
          />
        ))} 
        </div>
      </div>
    </>
  );
}

export default TeamList;