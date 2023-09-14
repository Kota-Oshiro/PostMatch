import React, { useRef, useEffect } from 'react';
import './ScheduleTab.css';

function ScheduleTab({ competitionId, tabMatchday, setTabMatchday, setFetchedMatchday, minTab, maxTab }) {

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
            className={`schedule-matchday ${tabMatchday === tab ? 'active' : ''} ${competitionId === 2001 && tab >= 7 && tab <= 12 ? 'tournament' : ''}`}
            onClick={() => handleTabClick(tab)}
        >
          {getTabLabel(competitionId, tab)}
        </span>
    ))}
    </div>
  );
}

function getTabLabel(competitionId, tab) {
  if (competitionId === 2001) {
    switch(tab) {
      case 1: case 2: case 3: case 4: case 5: case 6:
        return `${tab}節`;
      case 7:
        return <>ラウンド16<br />1st</>;
      case 8:
        return <>ラウンド16<br />2nd</>;
      case 9:
        return <>準々決勝<br />1st</>;
      case 10:
        return <>準々決勝<br />2nd</>;
      case 11:
        return <>準決勝<br />1st</>;
      case 12:
        return <>準決勝<br />2nd</>;
      case 13:
        return '決勝';
      default:
        return '';
    }
  } else {
    return `${tab}節`;
  }
}

export default ScheduleTab;
