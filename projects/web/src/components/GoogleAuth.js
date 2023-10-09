import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import { getCsrfToken } from '../Utility';
import { AuthContext } from '../AuthContext';

import '../styles/socialButton.css';
import { ReactComponent as GoogleIcon } from '../icons/social_google.svg';

function GoogleAuthLogin() {

  const { login, setToastId, setToastMessage, setToastType } = useContext(AuthContext);
  const navigation = useNavigate();

  const handleGoogleResponse = async (codeResponse) => {

    try {
      // CSRFトークンを取得
      const csrfToken = getCsrfToken();

      const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/google_auth/`, 
          {
              auth_code: codeResponse.code, // 認証コードをPOST
          },
          {
              withCredentials: true,
              headers: {
                  'X-CSRFToken': csrfToken,
              }
          }
      );
      
      if (res.status === 200) { 
      
        let action = res.data.action; // 取得したactionを確認
        if (action === 'login') {
          login(res.data.current_user, res.data);
          setToastId(uuidv4());
          setToastMessage('ログインに成功しました')
          setToastType('success')
        }
      
        if (action === 'register') {
          login(res.data.current_user, res.data);
          navigation('/user/edit');
        }
      }

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error login:', error);
      }
      setToastId(uuidv4());
      setToastMessage('ログインに失敗しました')
      setToastType('error')
      }      
    }

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleResponse, // 認証コードを取得
    flow: 'auth-code',
    scope: 'email profile openid', // scopeはスペース区切り
  });

  return (
    <div onClick={googleLogin} className='social-login-button'>
      <GoogleIcon className='social-login-icon' />
      <span className='social-login-text'>Googleでログイン</span>
    </div>
  );
}

export default function GoogleAuthComponent() {

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // 認証用のProviderにGCPのクライアントIDを設定
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleAuthLogin />
    </GoogleOAuthProvider>
  );
}
