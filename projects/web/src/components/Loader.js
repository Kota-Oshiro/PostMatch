import React from 'react';
import './Loader.css';

export function Loader() {
  return (
    <div className='loader-container'>
      <div className='loader'></div>
    </div>
  );
}

export function LoaderInTabContent() {
  return (
    <div className='loader-tab-container'>
      <div className='loader'></div>
    </div>
  );
}

export function LoaderInButton() {
  return (
    <div className='loader-in-button'></div>
  );
}

export function LoaderInContent() {  
  return (
    <div className='loader-in-content-container'>
      <div className='loader'></div>
    </div>
  );
}