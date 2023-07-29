import React from 'react';

function GoogleFormLink({ currentUser, className, formId, questionId, children }) {

  let googleFormUrl;

  if (currentUser) {
    googleFormUrl = `https://docs.google.com/forms/d/e/${formId}/viewform?usp=pp_url&entry.${questionId}=${currentUser}`;
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
      currentUser={currentUser}
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
      currentUser={currentUser}
      className={className} 
      formId='1FAIpQLSfL6yaWTddV_E3tkImwvEvcNxL6JDDv7qP7ZBqpux4rnk0xSw' 
      questionId='901240505'
    >
      ご意見箱
    </GoogleFormLink>
  );
}

export { Inquiryform, SuggestionBox };

