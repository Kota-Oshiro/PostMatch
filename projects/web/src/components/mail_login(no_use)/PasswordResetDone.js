import { Link } from 'react-router-dom';
import BaseForm from './BaseForm';

import { ReactComponent as MailIcon } from '../icons/mail.svg';

const PasswordResetDone = () => {

  return (
    <BaseForm>
      <h2 className="form-title">再設定メールを送信しました</h2>
      <MailIcon className="form-icon" />
      <span className="form-description">入力したメールアドレスにパスワードの再設定メールを送信しました。リンクをクリックして新しいパスワードを設定してください。</span>
      <Link to="/" className='button'>トップページに戻る</Link>
    </BaseForm>
  );
};

export default PasswordResetDone;
