import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ReactComponent as ErrorImg } from '../../icons/football_coat.svg';

import './Error.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Helmet>
            <title>Internal Server Error - ポストマッチ</title>
          </Helmet>
    
          <div className='error-container'>
            <h1 className='error-title'>5-0-0</h1>
            <ErrorImg className='error-image'/>
            <h2 className='error-title-sub'>Internal Server Error</h2>
            <div className='error-block'>
              <p>アクセスしようとしたページは表示できませんでした。</p>
            </div>
            <Link to='/' className='button'>トップページに戻る</Link>
          </div>
        </>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;