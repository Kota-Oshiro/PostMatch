import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet';
import axios from 'axios';

import './TeamList.css';
import { Loader } from './Loader';
import TeamCard from './TeamCard';
import NotFoundPage from './error/NotFoundPage';

function TeamList() {
  const { competition_id, season_id } = useParams();

  // teamのフェッチ
  const fetchTeams = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/team/${competition_id}/${season_id}`);
    return res.data;
  };
  
  const { data, isLoading, isError, error } = useQuery(['team', competition_id, season_id], fetchTeams, {
    retry: 0,
  });
  
  if (isLoading) {
    return <Loader />; // データがロード中の場合はLoaderを表示
  }

  if (isError) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Helmet>
        <title>イングランドプレミアリーグ - ポストマッチ</title>
        <meta property='og:title' content='イングランドプレミアリーグ - ポストマッチ' />
      </Helmet>
      <div className='bg'></div>
      <div className='team-list-container'>
        <div className='team-list-league'>
          <img src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Icon/ENG.webp' className='schedule-league-img' />
          <h2 className='schedule-header-text'>イングランドプレミアリーグ</h2>
        </div>
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