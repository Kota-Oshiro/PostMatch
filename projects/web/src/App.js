import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from './AuthContext';

import ErrorBoundary from './components/error/ErrorBoundary';
import NotFoundPage from './components/error/NotFoundPage';

import './components/teaser/Teaser.css';
import IndexBackgroundTeaser from './components/teaser/IndexBackgroundTeaser';

import { ReactComponent as LogoText } from './logos/logo_text_white.svg';

const queryClient = new QueryClient();

function Index() {

  return (
    <>
    <div className='teaser-container'>
      <IndexBackgroundTeaser />
      <div className='teaser-top'>
        <LogoText className='teaser-logo' />
        <span className='teaser-title'>近 日 公 開 予 定</span>
      </div>
      <span className='teaser-rights'>© POST MATCH</span>
    </div>
    <div className='bg'></div>
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