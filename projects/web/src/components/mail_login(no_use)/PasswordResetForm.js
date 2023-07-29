import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import BaseForm from './BaseForm';

import { AuthContext } from '../AuthContext';

const PasswordResetForm = () => {

  const { setNotifyErrorMessage } = useContext(AuthContext);

  const navigation = useNavigate();

  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/password_reset/`, { email })
      .then(res => {
        navigation("/password_reset_done")
      })
      .catch(error => {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Failed to send Email:", error);
        }
        setNotifyErrorMessage(error.response.data.message);
      });
  };

  return (
    <BaseForm>
      <Link to="/">
        <img className="form-logo" src="https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/logo-text.webp"/>
      </Link>
      <h2 className="form-title">パスワードの再設定</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">メールアドレス</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <button type="submit">再設定メールを送信</button>
      </form>
    </BaseForm>
  );
};

export default PasswordResetForm;
