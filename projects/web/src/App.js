import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';

import { AuthProvider } from './AuthContext';

import Toast from './components/Toast';

import Header from './components/Header';
import Footer from './components/Footer';
import BottomNavigation from './components/BottomNavigation.js';

import UserDetail from './components/UserDetail';
import UserEdit from './components/UserEdit';
import TeamList from './components/TeamList';
import TeamDetail from './components/TeamDetail';
import Match from './components/Match';
import Schedule from './components/Schedule';
import Posts from './components/Posts';
import PostDetail from './components/PostDetail';

import Privacy from './components/article/Privacy';
import Term from './components/article/Terms';

import IndexBackground from './components/IndexBackground';
import MatchCard from './components/MatchCard';

import ErrorBoundary from './components/error/ErrorBoundary';
import NotFoundPage from './components/error/NotFoundPage';

import { AuthContext } from './AuthContext';
import { Loader } from './components/Loader';

import './App.css';
import { ReactComponent as LogoText } from './logos/logo_text_white.svg';
import { ReactComponent as FireIcon } from './icons/fire.svg';

const queryClient = new QueryClient();

function Index() {

  const { currentUser, authRestored } = useContext(AuthContext);

  // 初期レンダリング
  const fetchFeatureMatch = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/index/`, {withCredentials: true});
    return res.data.featured_match;
  };
    
  const { data, isLoading, isError, error } = useQuery(
    ['match', currentUser?.support_team], 
    fetchFeatureMatch,
    { enabled: authRestored }
  );

  // 初回レンダリング時にmatchのレンダリングまでLoaderを表示
  if (!authRestored || isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <>
    <div className='top-container'>
      <IndexBackground />
    </div>
    <div className='bg'></div>
    </>
  );
}

function ToastHandler() {
  const { toastId, toastMessage, toastType } = useContext(AuthContext);

  return (
    <>
      <Toast id={toastId} message={toastMessage} type={toastType} />
    </>
  );
}

function App() {
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div>
              <Header />
              <ToastHandler />
              <Routes>
                <Route path='/' element={<Index />} />
                <Route path='/user/:id' element={<UserDetail />} />
                <Route path='/user/edit' element={<UserEdit />} />
                <Route path='/privacy' element={<Privacy />} />
                <Route path='/terms' element={<Term />} />
                <Route path='*' element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;