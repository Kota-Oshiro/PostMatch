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

import IndexBackgroundTeaser from './components/teaser/IndexBackgroundTeaser';
import MatchCard from './components/MatchCard';

import ErrorBoundary from './components/error/ErrorBoundary';
import NotFoundPage from './components/error/NotFoundPage';

import { AuthContext } from './AuthContext';
import { LoaderIndex } from './components/Loader';  

import './components/teaser/Teaser.css';
import { ReactComponent as LogoText } from './logos/logo_text_white.svg';
import { ReactComponent as XIcon } from './icons/x_white.svg';
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

  return (
    <>
    <div className='teaser-container'>
      <IndexBackgroundTeaser />
      <div className='teaser-top'>
        <LogoText className='teaser-logo' />
        <span className='teaser-title'>近 日 公 開 予 定</span>
      </div>
      <a href='https://twitter.com/postmatch_jp' target='_blank' rel='noopener noreferrer'>
        <XIcon  className='teaser-sns' />
      </a>
      <span className='teaser-rights'>© POST MATCH</span>
    </div>
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
              <Routes>
                <Route path='/' element={<Index />} />
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