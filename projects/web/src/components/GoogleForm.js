import React from 'react';

import { ReactComponent as AlartIcon } from '../icons/alart.svg';

function GoogleFormLink({ id, className, formId, questionId, children }) {

  let googleFormUrl;

  if (id) {
    googleFormUrl = `https://docs.google.com/forms/d/e/${formId}/viewform?usp=pp_url&entry.${questionId}=${id}`;
  } else {
    googleFormUrl = `https://docs.google.com/forms/d/e/${formId}/viewform`;
  }

  return (
    <a href={googleFormUrl} className={className} target='_blank' rel='noopener noreferrer'>
      {children}
    </a>
  );
}

function Inquiryform({ currentUser, className }) {
  return (
    <GoogleFormLink 
      id={currentUser}
      className={className} 
      formId='1FAIpQLSej2cr85cbJ4jTywNygoe4xZVGB0gxVurhfOhme2CSQ4nqJIg' 
      questionId='1509517378'
    >
      お問合せ
    </GoogleFormLink>
  );
}

function SuggestionBox({ currentUser, className }) {
  return (
    <GoogleFormLink 
      id={currentUser}
      className={className} 
      formId='1FAIpQLSfL6yaWTddV_E3tkImwvEvcNxL6JDDv7qP7ZBqpux4rnk0xSw' 
      questionId='901240505'
    >
      ご意見箱
    </GoogleFormLink>
  );
}

function ReportForm({ post }) {
  return (
    <GoogleFormLink 
      id={post}
      className='ellipsis-menu-block'
      formId='1FAIpQLSezl9T2NfEpTh1y9SP815dtr7xRheA_XM6cTIZ4hpEkz3nYCA' 
      questionId='901240505'
      onClick={(e) => e.stopPropagation()}
    >
      <AlartIcon className='ellipsis-menu-icon' />
    </GoogleFormLink>
  );
}

export { Inquiryform, SuggestionBox, ReportForm };

