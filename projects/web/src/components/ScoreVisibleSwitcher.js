import React from 'react';

import './ScoreVisibleSwitcher.css';

function ScoreVisibleSwitcher({ isScoreVisible, setScoreVisible }) {

  // タブをクリックしたときにタブを切り替える
  const openForm = (formName) => {
    setScoreVisible(formName);
  };

  return (
  <div className='switcher' onClick={() => setScoreVisible(!isScoreVisible)}>
      <div className={`switch-slider ${isScoreVisible ? 'right' : 'left'}`}></div>
      <div className='switch-status'>
        <span className={`switch-text ${!isScoreVisible ? 'active' : ''}`}>OFF</span>
        <span className={`switch-text ${isScoreVisible ? 'active' : ''}`}>スコア</span>
      </div>
  </div>
  );
}

export default ScoreVisibleSwitcher;
