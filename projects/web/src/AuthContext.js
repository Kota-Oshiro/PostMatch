/*ログイン状態の管理*/

import React, { createContext, useState, useEffect } from "react";
import { useQueryClient } from 'react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authRestored, setAuthRestored] = useState(false); //インデックスのローダー処理のために使う（restored→indexフェッチの間ローダー表示）

  const [toastId, setToastId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);


  // 初期化時にクッキーからトークンを読み出す
  useEffect(() => {
    const initAuth = async () => {
      // ユーザー情報の取得
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user_auth_restore/`, {withCredentials: true});
        
        if (response.data && !response.data.error && !response.data.message) {
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
        
      } catch (error) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setAuthRestored(true);
      }
    };
    initAuth();
  }, []);
  

  // ログイン状態を更新する関数
  const login = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_BASE_URL}/logout/`, {withCredentials: true});

      // Authorizationヘッダーを削除
      delete axios.defaults.headers.common['Authorization'];

      // ログイン状態を更新
      setIsAuthenticated(false);
      setCurrentUser(null);
      setToastId(uuidv4());
      setToastMessage('ログアウトしました')
      setToastType('delete')

    } catch (error) {
      setToastId(uuidv4());
      setToastMessage('ログアウトに失敗しました')
      setToastType('error')
    }
  };

  // UserEditのユーザー編集後のアップデートを反映する
  const updateSupportTeam = (newSupportTeam) => {
    setCurrentUser(current => ({ ...current, support_team: newSupportTeam }));
  };

  const updateUserImg = (newImgUrl) => {
    setCurrentUser(current => ({ ...current, profile_image: newImgUrl }));
  };

  // indexのfeatured_matchのクエリを無効化して再取得する
  useEffect(() => {
    queryClient.invalidateQueries(['match', currentUser?.support_team]);
  }, [currentUser?.support_team, queryClient]);
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated, authRestored, currentUser,
      login, logout,
      toastId, setToastId,
      toastMessage, setToastMessage,
      toastType, setToastType,
      updateSupportTeam, updateUserImg,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

