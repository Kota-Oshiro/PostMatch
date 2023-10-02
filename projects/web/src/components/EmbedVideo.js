import React from 'react';

import './EmbedVideo.css';
import { ReactComponent as VideoIcon } from '../icons/youtube_grey.svg';

function EmbedVideo({ match }) {

  const url = match.highlight_video_url;
  const embedUrl = url.replace("watch?v=", "embed/");

  return (
    <div className='embed-container'>
      <div className='embed-wrapper'>
        <div className='embed-header'>
          <VideoIcon className='embed-icon'/>
          <h2 className='embed-title'>ハイライトを観る</h2>
        </div>
        <div className='embed-youtube'>
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default EmbedVideo;
