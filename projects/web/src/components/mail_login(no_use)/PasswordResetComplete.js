import { Link } from 'react-router-dom';
import BaseForm from '../BaseForm';

import { ReactComponent as MailIcon } from '../icons/success.svg';

const PasswordResetComplete = () => {

  return (
    <BaseForm>
      <h2 className="form-title">パスワードの再設定が完了しました</h2>
      <MailIcon className="form-icon" />
      <span className="form-description">パスワードの変更が完了しました。新しいパスワードでログインしてください。</span>
      <Link to="/login" className='button'>ログインページへ</Link>
    </BaseForm>
  );
};

export default PasswordResetComplete;
