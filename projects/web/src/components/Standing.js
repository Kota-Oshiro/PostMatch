import React, { useState, useEffect, useContext, useRef, createContext } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet';

import { AuthContext } from '../AuthContext';

import './Standing.css';

import { SkeletonScreenStandingList } from './Loader';

import StandingCard from './StandingCard';
import LeagueSelecter from './LeagueSelecter';
import NotFoundPage from './error/NotFoundPage';

import { getDefaultCompetitionId,getCompetitionName, getCompetitionColor, getCompetitionIcon } from './UtilityCompetition';

export const FetchContext = createContext();

function Standing() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { currentUser, apiBaseUrl } = useContext(AuthContext);

  const initialCompetitionId = getDefaultCompetitionId(currentUser);
  const initialCompetitionName = getCompetitionName(initialCompetitionId);
  const initialCompetitionColor = getCompetitionColor(initialCompetitionId);
  const initialCompetitionIcon = getCompetitionIcon(initialCompetitionId);

  const [competitionId, setCompetitionId] = useState(initialCompetitionId);
  const [seasonYear, setseasonYear] = useState(2023);

  const [competitionIcon, setCompetitionIcon] = useState(initialCompetitionIcon);
  const [competitionName, setCompetitionName] = useState(initialCompetitionName);
  const [competitionColor, setCompetitionColor] = useState(initialCompetitionColor);

  const [isLeagueSelectModalVisible, setLeagueSelectModalVisible] = useState(false);

  // 初期レンダリング  
  const fetchStanding = async () => {
    const res = await apiBaseUrl.get(`/standing/${competitionId}/`);
    return res.data.standings;
  };
  
  const { data, isLoading, isError, error } = useQuery(['standing', competitionId, seasonYear], fetchStanding );

  // UIでgroup名で日本語変換する（UCL用）
  const getGroupLabel = (groupKey) => {
    const groupNumber = groupKey.split(' ')[1];
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
          <title>{competitionName}の順位表 - ポストマッチ</title>
          <meta property='og:title' content={`${competitionName}の順位表 - ポストマッチ`} />
      </Helmet>

      <div className='bg'></div>

      <div className='standing-wrapper'>
        <FetchContext.Provider value={{ fetchStanding, isLoading }}>
          <div className='standing-container'>
            <div className='content-bg' style={{ backgroundImage: `linear-gradient(${competitionColor}, #f7f7f7 360px)` }}>
              
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

              <div className='standing-cards'>
              
                {competitionId !== 2001 &&
                  <div className='standing-column'>
                    <div className='standing-column-block'>
                      <span className='standing-column-name'>#</span>
                      <span className='standing-column-name standing-column-long'>チーム</span>
                    </div>
                    <div className='standing-column-block'>
                      {["済", "PT", "勝", "分", "負", "得", "失", "差", "次"].map((name, idx) => (
                        <span className={`standing-column-name ${idx === 8 ? 'standing-column-last' : ''}`}>{name}</span>
                      ))}
                    </div>
                  </div>
                }
                
                {isLoading ? (
                  <>
                    {competitionId === 2001 && (
                      <div className='standing-column'>
                        <div className='standing-column-block'>
                          <span className='standing-column-name'>#</span>
                          <span className='standing-column-name standing-column-long'>チーム</span>
                        </div>
                        <div className='standing-column-block'>
                          {["済", "PT", "勝", "分", "負", "得", "失", "差", "次"].map((name, idx) => (
                            <span className={`standing-column-name ${idx === 8 ? 'standing-column-last' : ''}`}>{name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <SkeletonScreenStandingList />
                  </>
                ) : (
                  competitionId === 2001 && data && data.length > 0 && data[0].stage === "GROUP_STAGE" ? (
                    Object.entries(
                      data.reduce((acc, standing) => {
                        (acc[standing.group] = acc[standing.group] || []).push(standing);
                        return acc;
                      }, {})
                    ).map(([group, standings]) => (
                      <div key={group}>
                        <h2 className='standing-group-title'>{getGroupLabel(group)}</h2>
                        <div className='standing-column-groupstage'>
                          <div className='standing-column-block'>
                            <span className='standing-column-name'>#</span>
                            <span className='standing-column-name standing-column-long'>チーム</span>
                          </div>
                          <div className='standing-column-block'>
                            {["済", "PT", "勝", "分", "負", "得", "失", "差", "次"].map((name, idx) => (
                              <span className={`standing-column-name ${idx === 8 ? 'standing-column-last' : ''}`}>{name}</span>
                            ))}
                          </div>
                        </div>
                        {standings.map((standing, i) => (
                          <StandingCard
                            key={standing.team.id}
                            data={standing}
                            competitionId={competitionId}
                            isLast={i === standings.length - 1}
                          />
                        ))}
                      </div>
                    ))
                  ) : (
                    data && data.map((standing, i) => (
                      <StandingCard
                        key={standing.team.id}
                        data={standing}
                        competitionId={competitionId}
                        isFirst={ ((competitionId === 2021 || competitionId === 2014 || competitionId === 2019) && i >= 0 && i <= 3) || ((competitionId === 2119 || competitionId === 2001) && i >= 0 && i <= 1 ) }
                        isSecond={ ((competitionId === 2021 || competitionId === 2014 || competitionId === 2019) && i === 4) || ((competitionId === 2119 || competitionId === 2001) && i === 2 )}
                        isThird={ (competitionId === 2014 || competitionId === 2019) && i === 5 }
                        isBottom={ ((competitionId === 2021 || competitionId === 2014 || competitionId === 2019) && i >= 17 && i <= 19) || (competitionId === 2119 && i === 17 )}
                        isLast={i === data.length - 1 && standing.stage !== 'FINAL'}
                        isSingle={standing.stage === 'FINAL'}
                      />
                    ))
                  )
                )}

                <div className='standing-discription'>
                  <div className='standing-column-block'>
                    <span className='standing-discription-circle circle-ucl'></span>
                    <span className='standing-discription-text'>
                      {competitionId === 2021 || competitionId === 2014 || competitionId === 2019 ? 
                        'チャンピオンズリーグ' 
                      : competitionId === 2119 ? 
                        'AFCチャンピオンズリーグ' 
                      : competitionId === 2001 ? 
                      '決勝トーナメント進出' 
                      : ''
                      }
                    </span>
                  </div>
                  <div className='standing-column-block'>
                    <span className='standing-discription-circle circle-uel'></span>
                    <span className='standing-discription-text'>
                      {competitionId === 2021 || competitionId === 2014 || competitionId === 2019 ? 
                        'ヨーロッパリーグ' 
                      : competitionId === 2119 ? 
                        'AFCチャンピオンズリーグ予選'
                      : competitionId === 2001 ? 
                      'ヨーロッパリーグプレーオフ' 
                      : ''
                      }
                    </span>
                  </div>
                  { (competitionId === 2014 || competitionId === 2019) &&
                    <div className='standing-column-block'>
                      <span className='standing-discription-circle circle-uecl'></span>
                      <span className='standing-discription-text'>カンファレンスリーグ予選</span>
                    </div>
                  }
                  { competitionId !== 2001 &&
                    <div className='standing-column-block'>
                      <span className='standing-discription-circle circle-demotion'></span>
                      <span className='standing-discription-text'>降格</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </FetchContext.Provider>
      </div>  
    </>
  );
}
  
export default Standing;
