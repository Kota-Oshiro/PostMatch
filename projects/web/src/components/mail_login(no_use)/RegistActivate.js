import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams  } from 'react-router-dom';
import axios from 'axios';
import getCsrfToken from '../../Utility';
import { AuthContext } from '../../AuthContext';
import BaseForm from '../BaseForm';
import { Loader } from '../Loader';

import { ReactComponent as SuccessIcon } from '../icons/success.svg';
import { ReactComponent as ErrorIcon } from '../icons/error.svg';


function RegistActivate() {

  const { uid, token } = useParams();
  const [message, setMessage] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { login, currentUser } = useContext(AuthContext);

  useEffect(() => {
    const csrfToken = getCsrfToken();
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/activate/`, { uidb64: uid, token: token }, {withCredentials: true})
        .then(res => {
          setMessage(res.data.message);
          setAuthStatus(res.data.status);
          if (res.data.current_user) {
            login(res.data.current_user, res.data);
          }
          setIsLoading(false);
        })
        .catch(err => {
          if (err.response && err.response.data) {
            setMessage(err.response.data.message);
          }
          setIsLoading(false);
        });
        
  }, [uid, token]);


  if (isLoading) {
    return <Loader />;
  }

  return (
    <BaseForm>
      <h2 className="form-title">{message}</h2>
      {authStatus === "success" ? (
        <SuccessIcon className="form-icon" />
      ) : (
        <ErrorIcon className="form-icon" />
      )} 
      <span className="form-description">
        {authStatus === "success"
        ? "ポストマッチへようこそ！プロフィール情報を登録してあなたの応援するチームや自己紹介を公開しましょう。"
        : "認証に失敗しました。もう一度アカウントの登録と認証をおこなってください。"}
      </span>
      {authStatus === "success" && currentUser 
        ? <Link className="button" to={`/user/edit`}>プロフィール設定に進む</Link>
        : <Link className="button" to="/login?tab=register">登録ページに戻る</Link>
      }
    </BaseForm>
  );
};

export default RegistActivate;
