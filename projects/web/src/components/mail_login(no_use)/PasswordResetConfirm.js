import React, { useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import BaseForm from './BaseForm';

function PasswordResetConfirm() {

  const navigation = useNavigate();

  const { uid, token } = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [passwordLengthError, setPasswordLengthError] = useState("");


  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    let isValid = true;
  
    if (newPassword !== newPassword2) {
      const passwordMatchError = 'パスワードが一致していません';
      if (process.env.NODE_ENV !== 'production') {
        console.error(passwordMatchError);
      }
      setPasswordMatchError(passwordMatchError);
      isValid = false;
    } else {
      setPasswordMatchError('');
    }

    if (newPassword.length < 10) {
      const passwordLengthError = 'パスワードは10文字以上で設定してください';
      if (process.env.NODE_ENV !== 'production') {
        console.error(passwordLengthError);
      }
      setPasswordLengthError(passwordLengthError);
      isValid = false;
    } else {
      setPasswordLengthError('');
    }
      
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(validateForm()) {
      axios.post(`${process.env.REACT_APP_API_BASE_URL}/password_reset/confirm/`, { uidb64: uid, token: token, new_password: newPassword, re_new_password: newPassword2 })
        .then(res => {
          navigation("/password_reset_complete")
        })
        .catch(error => {
          if (process.env.NODE_ENV !== 'production') {
            console.error(error.response.data.message);
          }
          setErrorMessage(error.response.data.message);
        });
    }
  };

  return (
    <BaseForm>
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">新しいパスワードを設定</h2>
        {errorMessage && <span className="error-message">{errorMessage}</span>}
        <label htmlFor="password">パスワード</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <label htmlFor="password2">パスワードの確認</label>
        <input type="password" value={newPassword2} onChange={e => setNewPassword2(e.target.value)} required />
        {passwordMatchError && <span className="error-message">{passwordMatchError}</span>}
        {passwordLengthError && <span className="error-message">{passwordLengthError}</span>}
        <button type="submit">パスワードを変更する</button>
      </form>
    </BaseForm>
  );
};

export default PasswordResetConfirm;

