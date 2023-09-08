/*ログイン状態の管理*/

import React, { createContext, useState, useEffect } from "react";
import { useQueryClient } from 'react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const AuthContext = createContext(null);

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
        const response = await apiBaseUrl.get(`/user_auth_restore/`, {
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            }
        });

        if (response.status === 200 && response.data && !response.data.error && !response.data.message) {
            setCurrentUser(response.data);
            setIsAuthenticated(true);
        } else if (response.status === 401 && response.data.error === 'Invalid token') {
            // accessTokenが無効な場合、refreshTokenを取得して新しいaccessTokenをセット
            const refreshTokenResponse = await apiBaseUrl.get(`/get_refresh_token/`);

            if (refreshTokenResponse.data && refreshTokenResponse.data.refresh) {
                const newTokenResponse = await apiBaseUrl.post(`/set_new_token/`, {
                    refresh: refreshTokenResponse.data.refresh
                }, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                });

                if (newTokenResponse.data && newTokenResponse.data.access) {
                    const userResponse = await apiBaseUrl.get(`/user_auth_restore/`);

                    if (userResponse.data && !userResponse.data.error && !userResponse.data.message) {
                        setCurrentUser(userResponse.data);
                        setIsAuthenticated(true);
                    } else {
                        setIsAuthenticated(false);
                        setCurrentUser(null);
                    }
                }
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }

        setAuthRestored(true);
    };

    initAuth();
  }, []);

  // APIリクエストの共通部分をインスタンス化
  const apiBaseUrl = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true
  });

  // レスポンスをインターセプト
  apiBaseUrl.interceptors.response.use(response => {
    // 成功レスポンスはそのまま返す
    return response;
  }, async error => {
    if (error.response.status === 401) {
        const refreshTokenResponse = await apiBaseUrl.get(`/get_refresh_token/`);

        if (refreshTokenResponse.data && refreshTokenResponse.data.refresh) {
            const newTokenResponse = await apiBaseUrl.post(`/set_new_token/`, {
                refresh: refreshTokenResponse.data.refresh
            });

            if (newTokenResponse.data && newTokenResponse.data.access) {
                // 新しいトークンをヘッダーにセット
                apiBaseUrl.defaults.headers.common['Authorization'] = `Bearer ${newTokenResponse.data.access}`;

                // 元のリクエストを再実行
                return apiBaseUrl(error.config);
            }
        }
    }

    return Promise.reject(error);
  });

  // ログイン状態を更新する関数
  const login = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const logout = async () => {
    try {
      await apiBaseUrl.get(`/logout/`);

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

  const updateSupportTeamCompetition = (newSupportTeam) => {
    setCurrentUser(current => ({ ...current, support_team_competition: newSupportTeam }));
  };

  const updateSupportTeamSeason = (newSupportTeam) => {
    setCurrentUser(current => ({ ...current, support_team_season: newSupportTeam }));
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
      isAuthenticated, currentUser, authRestored, apiBaseUrl,
      login, logout,
      toastId, setToastId,
      toastMessage, setToastMessage,
      toastType, setToastType,
      updateSupportTeam, updateSupportTeamCompetition, updateSupportTeamSeason, updateUserImg,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

