import React from 'react';
import { Link } from 'react-router-dom';
import BaseForm from './BaseForm';

import { ReactComponent as MailIcon } from '../icons/mail.svg';


function RegistTempSuccess() {
  return (
    <BaseForm>
      <h2 className="form-title">アカウントの認証メールを送信しました！</h2>
      <MailIcon className="form-icon" />
      <span className="form-description">メールの認証リンクをクリックして本登録を完了してください。</span>
      <Link to="/" className="button">トップページに戻る</Link>
    </BaseForm>
  );
};

export default RegistTempSuccess;
