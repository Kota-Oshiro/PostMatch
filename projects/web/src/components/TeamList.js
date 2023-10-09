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

import { getDefaultCompetitionId, getCompetitionName, getCompetitionColor, getCompetitionIcon } from '../Utility';

function TeamList() {
  
  const { currentUser } = useContext(AuthContext);

  const initialCompetitionId = getDefaultCompetitionId(currentUser);

  const initialCompetitionName = getCompetitionName(initialCompetitionId);
  const initialCompetitionColor = getCompetitionColor(initialCompetitionId);
  const initialCompetitionIcon = getCompetitionIcon(initialCompetitionId);
  
  const [competitionId, setCompetitionId] = useState(initialCompetitionId);
  const [competitionIcon, setCompetitionIcon] = useState(initialCompetitionIcon);
  const [competitionName, setCompetitionName] = useState(initialCompetitionName);
  const [competitionColor, setCompetitionColor] = useState(initialCompetitionColor);
  
  const [isLeagueSelectModalVisible, setLeagueSelectModalVisible] = useState(false);

  // teamのフェッチ
  const fetchTeams = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/teams/${competitionId}/`);
    return res.data;
  };
  
  const { data, isLoading, isError, error } = useQuery(['team', competitionId], fetchTeams, {
    retry: 0,
  });
  
  if (isLoading) {
    return (
      <>
      <div className='bg'></div>
      <div className='team-list-container'>
        <div className='content-bg-double' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)`}} >
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
          <SkeletonScreenTeam />
        </div>
      </div>
      </>
    )
  }

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
        <title>{competitionName}のクラブ一覧 - ポストマッチ</title>
        <meta property='og:title' content={`${competitionName}のクラブ一覧 - ポストマッチ`} />
      </Helmet>

      <div className='bg'></div>
      <div className='team-list-container'>
        <div className='content-bg-double' style={{backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)`}} >
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
          <div className='team-cards'>
            {data && data.map(team => (
              <TeamCard 
                key={team.id} 
                team={team}
              />
            ))} 
          </div>
        </div>
      </div>
    </>
  );
}

export default TeamList;