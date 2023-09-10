import React, { useRef, useEffect } from 'react';
import './ScheduleTab.css';

function ScheduleTab({ tabMatchday, setTabMatchday, setFetchedMatchday, minTab, maxTab }) {

  const tabs = [];
  for (let i = minTab; i <= maxTab; i++) {
    tabs.push(i);
  }

  const handleTabClick = (tab) => {
    setTabMatchday(tab);
    setFetchedMatchday(tab);
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
  }, [tabMatchday]);

  return (
    <div className='schedule-tab'>
        {tabs.map(tab => (
        <span 
            key={tab}
            ref={tabMatchday === tab ? tabRef : null}
            className={`schedule-matchday ${tabMatchday === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
        >
            {tab}節
        </span>
    ))}
    </div>
  );
}

export default ScheduleTab;
