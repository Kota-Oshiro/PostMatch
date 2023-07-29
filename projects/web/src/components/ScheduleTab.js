import React, { useRef, useEffect, useState, useContext } from 'react';
import './ScheduleTab.css';
import { FetchContext } from './Schedule';

function ScheduleTab({ currentMatchday, setCurrentMatchday }) {

  const { fetchData } = useContext(FetchContext);

  const minTab = 1;
  const maxTab = 38;
  const tabs = [];
  for (let i = minTab; i <= maxTab; i++) {
    tabs.push(i);
  }

  const handleTabClick = (tab) => {
    setCurrentMatchday(tab);
    fetchData(tab);
  };

  const tabRef = useRef(null);

  useEffect(() => {
    if (tabRef.current) {
      tabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [currentMatchday]);

  return (
    <div className='schedule-tab'>
        {tabs.map(tab => (
        <span 
            key={tab}
            ref={currentMatchday === tab ? tabRef : null}
            className={`schedule-matchday ${currentMatchday === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
        >
            {tab}節
        </span>
    ))}
    </div>
  );
}

export default ScheduleTab;
