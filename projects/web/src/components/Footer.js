import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../AuthContext';
import { Inquiryform, SuggestionBox } from './GoogleForm';

import './Footer.css';
import { ReactComponent as XIcon } from '../icons/x_grey.svg';

function Footer() {

  const { currentUser } = useContext(AuthContext);

  return (
    <footer>
      <div className='footer-menu'>
        <Link to='/blog' className='footer-text footer-link'>運営ブログ</Link>
        <Inquiryform currentUser={currentUser ? currentUser.id : null} className='footer-text footer-link' />
        <SuggestionBox currentUser={currentUser ? currentUser.id : null} className='footer-text footer-link' />
      </div>
      <div className='footer-menu'>
        <Link to='/terms' className='footer-text footer-link'>利用規約</Link>
        <Link to='/privacy' className='footer-text footer-link'>プライバシーポリシー</Link>
      </div>
      <div className='footer-menu'>
        <span className='footer-text'>公式SNS</span>
        <a href='https://twitter.com/postmatch_jp' className='footer-sns' target='_blank' rel='noopener noreferrer'>
          <XIcon className='footer-sns-icon' />
        </a>
      </div>
      <div className='footer-menu'>
        <span className='footer-text'>© POST MATCH</span>
      </div>
    </footer>
  );
}

export default Footer;
