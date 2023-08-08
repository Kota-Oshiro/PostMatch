import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import TagManager from 'react-gtm-module'

const root = ReactDOM.createRoot(document.getElementById('root'));

const gtmId = process.env.REACT_APP_GTM_ID;
const tagManagerArgs = { gtmId };

TagManager.initialize(tagManagerArgs)

root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

reportWebVitals();
