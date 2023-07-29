import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../AuthContext';

import GoogleAuth from './GoogleAuth';

import './LoginForm.css';
import { ReactComponent as LogoText } from '../logos/logo_text.svg';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

function LoginForm({ isLoginModalVisible, setLoginModalVisible }) {

  const { isAuthenticated } = useContext(AuthContext);

  const handleMenuClose = () => {
    setLoginModalVisible(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      setLoginModalVisible(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoginModalVisible) {
      // モーダルが開いている時はスクロールを無効にする
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じている時はスクロールを有効にする
      document.body.style.overflow = 'visible';
    }

    return () => {
      // コンポーネントがアンマウントされたときはスクロールを再度有効にする
      document.body.style.overflow = 'visible';
    };
  }, [isLoginModalVisible]);

  // モーダル以外をクリックすると閉じる
  useEffect(() => {
    const handleOutsideClick = (event) => {
      setLoginModalVisible((currentIsVisible) => {
        if (currentIsVisible && !document.getElementById('login-modal').contains(event.target)) {
          return false;
        }
        return currentIsVisible;
      });
    };
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className='login-modal' id='login-modal'>
      <div className='login-modal-content'>
        <div onClick={ handleMenuClose } className='modal-close'>
          <CloseIcon className='modal-close-img'/>
        </div>
        <LogoText className='login-modal-logo' />
        <p className='login-modal-text'>ポストマッチはサッカー観戦記録サービスです。ログインすると試合の感想を投稿や観戦リストの作成がご利用いただけます。</p>
        <GoogleAuth/>
        <p className='login-modal-text'>
          <Link to='/terms'>利用規約</Link>
          、
          <Link to='/privacy'>プライバシーポリシー</Link>
          に同意したうえでログインしてください。
        </p>
      </div>
    </div>

  );
}

export default LoginForm;
