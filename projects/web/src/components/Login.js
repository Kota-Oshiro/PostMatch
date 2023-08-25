import React, { useState } from 'react';

import './Login.css';

import LoginForm from './LoginForm';

function Register() {

  const [isLoginModalVisible, setLoginModalVisible] = useState(false);

  const handleLoginModal = (e) => {
    e.stopPropagation();
    setLoginModalVisible(true);
  };

  return (
    <>
    <div className={`modal-overlay ${isLoginModalVisible ? '' : 'hidden'}`}></div>
    
    {isLoginModalVisible &&
    <LoginForm
      isLoginModalVisible={isLoginModalVisible}
      setLoginModalVisible={setLoginModalVisible}
    />
    }

    <div className='register-container'>
      <span className='register-text' >ログインすると観戦記録をつけられます</span>
      <div className='register-button' onClick={handleLoginModal}>ログイン</div>
    </div>
    </>
  );
}

export default Register;
