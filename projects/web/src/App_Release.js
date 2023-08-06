import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';

import ReactGA4 from 'react-ga4';

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

import News from './components/article/News';
import NewsArticle  from './components/article/NewsArticle';
import Privacy from './components/article/Privacy';
import Term from './components/article/Terms';

import IndexBackground from './components/IndexBackground';
import MatchCard from './components/MatchCard';

import ErrorBoundary from './components/error/ErrorBoundary';
import NotFoundPage from './components/error/NotFoundPage';

import { AuthContext } from './AuthContext';
import { LoaderIndex } from './components/Loader';  

import './App.css';
import { ReactComponent as LogoText } from './logos/logo_text_white.svg';
import { ReactComponent as FireIcon } from './icons/fire.svg';

const queryClient = new QueryClient();

const ga4Id = process.env.REACT_APP_GA4_ID;
ReactGA4.initialize(ga4Id);

function UsePageViews() {

  let location = useLocation();

  useEffect(() => {
    ReactGA4.send('pageview');
  }, [location]);

  return null;
}

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
    return <LoaderIndex />;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <>
    <div className='top-container'>
      <IndexBackground />
      <div className='top'>
        <div className='top-content'>
          <span className='top-text'>熱狂を残そう、サッカーファンのための観戦記録サービス</span>
          <LogoText className='top-logo' />
          <div className='top-textarea'>
            <span className='top-text'>最新の試合を観たらタップして記録しよう</span>
            <FireIcon className='top-emoji' />
          </div>
          {data && <MatchCard match={data} /> }
        </div>
      </div>
    </div>
    <div className='bg'></div>
    <div className='news'>
      <span className='news-text'>2023/12/12</span>
      <Link to='' className='news-text'>サービスをリリースしました！</Link>
    </div>
    <div className='container-how-to-use'>
      <h2 className='index-title'>ポストマッチの使い方</h2>
      <div className='how-to-use'>
        <div className='how-to-use-step'>
          <div className='how-to-use-text'>
            <h3 className='how-to-use-title'>試合を選ぶ</h3>
            <p className='how-to-use-description'>スケジュールから記録する試合ページを開きます。</p>
          </div>
          <img className='how-to-use-img' src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/how-to-use-1.webp'/>
        </div>
        <div className='how-to-use-step'>
          <div className='how-to-use-text'>
            <h3 className='how-to-use-title'>観戦を記録</h3>
            <p className='how-to-use-description'>記録ボタンを押すと観戦記録に追加されます。</p>
          </div>
          <img className='how-to-use-img' src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/how-to-use-2.webp'/>
        </div>
        <div className='how-to-use-step'>
          <div className='how-to-use-text'>
            <h3 className='how-to-use-title'>感想をポスト</h3>
            <p className='how-to-use-description'>試合の感想とマンオブザマッチを投稿できます。</p>
          </div>
          <img className='how-to-use-img' src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/how-to-use-3.webp'/>
        </div>
        <div className='how-to-use-step'>
          <div className='how-to-use-text'>
            <h3 className='how-to-use-title'>熱狂を残そう！</h3>
            <p className='how-to-use-description'>過去の記録とポストがマイページに残ります。</p>
          </div>
          <img className='how-to-use-img' src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/how-to-use-4.webp'/>
        </div>
      </div>
    </div>
    <Footer />
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
          <UsePageViews />
            <div>
              <Header />
              <ToastHandler />
              <Routes>
                <Route path='/' element={<Index />} />
                <Route path='/user/:id' element={<UserDetail />} />
                <Route path='/user/edit' element={<UserEdit />} />
                <Route path='/team/:competition_id/:season_id' element={<TeamList />} />
                <Route path='/team/:id' element={<TeamDetail />} />
                <Route path='/match/:id' element={<Match />} />
                <Route path='/schedule/:competition_id/:season_id' element={<Schedule />} />
                <Route path='/posts/' element={<Posts />} />
                <Route path='/post/:id' element={<PostDetail />} />
                <Route path='/privacy' element={<Privacy />} />
                <Route path='/terms' element={<Term />} />
                <Route path='/news' element={<News />} />
                <Route path='/news/:path' element={<NewsArticle />} />                
                <Route path='*' element={<NotFoundPage />} />
              </Routes>
              <BottomNavigation />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;