import React from 'react';
import './Loader.css';

import ContentLoader from "react-content-loader"

import { Grid, ThreeDots, ColorRing } from 'react-loader-spinner';

export function Loader() {
  return (
    <div className='loader'>
      <ThreeDots
        height="24"
        width="24"
        radius="9"
        color="#888888"
        ariaLabel="loading"
      />
    </div>
  );
}

export function LoaderIndex() {
  return (
    <div className='loader-index'>
      <Grid
        height="24"
        width="24"
        color="#3465FF"
        ariaLabel="grid-loading"
        radius="12.5"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
}

export function LoaderInTabContent() {
  return (
    <div className='loader-tab-content'>
      <ThreeDots
        height="24"
        width="24"
        radius="9"
        color="#888888"
        ariaLabel="loading"
      />
    </div>
  );
}

export function LoaderInButton() {
  return (
    <div className='loader-in-button'></div>
  );
}

export function LoaderSpinner() {  
  return (
    <div className='load-spinner'>
      <ColorRing
        visible={true}
        height="48"
        width="48"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        colors={['#888', '#bbbbbb', '#eeeeee', '#bbbbbb', '#888']}
      />
    </div>
  );
}

export function SingleLoaderPost() {
  return (
    <ContentLoader 
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      width="100%"
    >
      <rect x="50" y="6" rx="6" ry="1" width="30%" height="14" /> 
      <rect x="50" y="25" rx="6" ry="1" width="20%" height="7" /> 
      <rect x="0" y="56" rx="6" ry="1" width="100%" height="10" /> 
      <rect x="0" y="76" rx="6" ry="1" width="80%" height="10" /> 
      <rect x="0" y="96" rx="6" ry="1" width="60%" height="10" /> 
      <circle cx="19" cy="19" r="19" />
    </ContentLoader>
  );
}

export function SkeletonScreenPost()  {
  const numLoaders = 3;
  return (
    <div className='loader-posts'>
      {Array(numLoaders).fill().map((_, i) => <SingleLoaderPost key={i} />)}
    </div>
  );
}

export function SingleLoaderTeam() {
  return (
    <div className='loader-teamcard'>
      <ContentLoader 
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      width="100%"
      >
      <rect x="0" y="0" rx="6" ry="6" width="100%" height="120" />
      </ContentLoader>
    </div>
  );
}

export function SkeletonScreenTeam()  {
  const numLoaders = 6;
  return (
    <div className='loader-teamcards'>
      {Array(numLoaders).fill().map((_, i) => <SingleLoaderTeam key={i} />)}
    </div>
  );
}

export function HeaderLoaderSchedule() {
  return (
      <ContentLoader 
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      width="100%"
      height={112}
      >
      <rect x="0" y="0" rx="6" ry="6" width="100%" height="112" />   
      </ContentLoader>
  );
}

export function SingleLoaderSchedule() {
  return (
      <ContentLoader 
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      width="100%"
      height={49}
      className='loader-schedulecard'
      >

      <circle cx="12" cy="25" r="12" />
      <rect x="36" y="18" rx="6" ry="1" width="44" height="14" />
      <circle cx="104" cy="25" r="12" />
      <rect x="140" y="18" rx="6" ry="1" width="50%" height="14" />      
      </ContentLoader>
  );
}

export function SkeletonScreenSchedule()  {
  const numLoaders = 10;
  return (
    <div className='loader-schedule-index'>
      <HeaderLoaderSchedule />
      {Array(numLoaders).fill().map((_, i) => <SingleLoaderSchedule key={i} />)}
    </div>
  );
}

export function SkeletonScreenScheduleMatchday() {
  return (
      <ContentLoader 
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      width="100%"
      height={20}
      className='loader-schedule-matchday'
      >

      <rect x="0" y="0" rx="4" ry="4" width="100%" height="20" />  
      </ContentLoader>
  );
}

export function SkeletonScreenScheduleList()  {
  const numLoaders = 10;
  return (
    <>
    <div className='loader-schedule'>
      {Array(numLoaders).fill().map((_, i) => <SingleLoaderSchedule key={i} />)}
    </div>
    </>
  );
}

export function SkeletonMatchCardList() {
  return (
    <div className='loader-matchcards'>
      <ContentLoader 
      speed={2}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      width="100%"
      height={244}
      >
      <rect x="0" y="0" rx="12" ry="12" width="100%" height="244" />   
      </ContentLoader>
    </div>
  );
}
