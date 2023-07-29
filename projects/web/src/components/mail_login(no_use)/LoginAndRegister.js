import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getCsrfToken from '../Utility';
import { AuthContext } from '../AuthContext';

import './LoginAndRegister.css';

import { LoaderInButton } from './Loader';

function LoginAndRegister() {

  const { login } = useContext(AuthContext);
  const location = useLocation();
  const navigation = useNavigate();
  const [currentTab, setCurrentTab] = useState('');
  const [loaderInButton, setLoaderInButton] = useState(false);

  // URLのパラメータに基づいてタブを切り替える
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    setCurrentTab(tab === 'register' ? 'register' : 'login');
  }, [location]);

  // タブをクリックしたときにタブを切り替える
  const openForm = (formName) => {
    setCurrentTab(formName);
  };

  // ログインフォームの状態管理
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');

  // 登録フォームの状態管理
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // バックエンドのエラーメッセージの状態管理
  const [loginErrorMessage, setLoginErrorMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // バリデーション（ログインと新規登録でバリデーションを分ける）
  const validateForm = async () => {
    let isValid = true;
  
    if (currentTab === 'login') {
      if (loginPassword.length < 10) {
        setLoginPasswordError('パスワードは10文字以上で設定してください');
        isValid = false;
      }
    }

    else if (currentTab === 'register') {
      if (username.length > 20) {
        setUsernameError('ユーザー名は20文字以内で設定してください');
        isValid = false;
      }
    
      if (email.length === 0) {
        setEmailError('メールアドレスを入力してください');
        isValid = false;
      }
    
      if (password !== confirmPassword) {
        setConfirmPasswordError('パスワードが一致していません');
        isValid = false;
      }
    
      if (password.length < 10) {
        setPasswordError('パスワードは10文字以上で設定してください');
        isValid = false;
      }
    }
    
    return isValid;
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();  // フォームのデフォルトの送信動作をキャンセル

    setLoaderInButton(true)

    let data;
    if (currentTab === 'login') {
      data = {
        action: 'login',
        email: loginEmail,
        password: loginPassword
      };
    } else {
      data = {
        action: 'register',
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      };
    }
    
    const isValid = await validateForm();
    if (isValid) {
      await submitForm(data, data.action);
    } else {
      setLoaderInButton(false)
    }
  };

  const submitForm = async (data, action) => {
    try {
      // CSRFトークンを取得
      const csrfToken = getCsrfToken();
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login_and_register/`, { ...data, action }, {withCredentials: true});

      if (res.status === 200) {  // リクエストが成功したかチェック
      
        if (action === 'login') {
          login(res.data.current_user, res.data);
          navigation(-1);  // ログイン成功後のページへリダイレクト
        }
      
        if (action === 'register') {
          navigation('/registration_success');  // 仮登録成功後のページへリダイレクト
        }
      }
      
      setLoginErrorMessage(null); // 成功したときはエラーメッセージをクリア
      setErrorMessage(null);

    } catch (error) {
      console.error('送信にエラーが発生しました', error);
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error submit:", error);
      }
      if (error.response) {
        // エラーメッセージをstateに保存
        if(action === 'login') {
          setLoginErrorMessage(error.response.data.message);
        } else if(action === 'register') {
          setErrorMessage(error.response.data.message);
        }
      }      
    } finally {
      setLoaderInButton(false)
    }
  }

  return (
      <div className='login-container'>
        <Link to='/' className='logo'>
          <img className='form-logo' src='https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/logo-text.webp'/>
        </Link>
        <div className='login-tab'>
          <button className={`login-tablinks ${currentTab === 'login' ? 'active' : ''}`} onClick={() => openForm('login')}>ログイン</button>
          <button className={`login-tablinks ${currentTab === 'register' ? 'active' : ''}`} onClick={() => openForm('register')}>新規登録</button>
        </div>
        {currentTab === 'login' ? (
          <div className='login-form-container'>
            <form onSubmit={handleSubmit}>
              <input type='hidden' name='action' value='login'/>
              <div className='form-group'>
                {loginErrorMessage && <div className='error-message'>{loginErrorMessage}</div>}
                <label htmlFor='email'>メールアドレス</label>
                <input
                  type='text'
                  id='email'
                  name='email'
                  placeholder='xxx@post-match.com'
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='password'>パスワード</label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  required
                />
                {loginPasswordError && <div className='error-message'>{loginPasswordError}</div>}
              </div>
              <div className='form-annotation-link-wrapper'>
                <Link to='/password_reset' className='form-annotation-link' alt='パスワードを忘れた方はこちら'>パスワードを忘れた方はこちら</Link>
              </div>    
              <button type='submit'>
                {!loaderInButton ? (
                <span className='button-text'>ログイン</span>
                ) : (
                <LoaderInButton />
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className='login-form-container'>
            <form onSubmit={handleSubmit}>
              <input type='hidden' name='action' value='register'/>
              <div className='form-group'>
                <label htmlFor='username'>ユーザー名</label>
                <input type='text' id='username' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='サッカー太郎' required/>
                {usernameError && <div className='error-message'>{usernameError}</div>}
                <span className='form-annotation'>※ユーザー名は後から変更できます</span>

                <label htmlFor='email'>メールアドレス</label>
                <input type='text' id='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='xxx@post-match.com' required/>
                {emailError && <div className='error-message'>{emailError}</div>}
                {errorMessage && <div className='error-message'>{errorMessage}</div>}

                <label htmlFor='password'>パスワード</label>
                <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} required/>
                {passwordError && <div className='error-message'>{passwordError}</div>}
                <span className='form-annotation'>※パスワードは10文字以上で設定してください</span>

                <label htmlFor='confirm-password'>パスワードの確認</label>
                <input type='password' id='confirm-password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                {confirmPasswordError && <div className='error-message'>{confirmPasswordError}</div>}
                <button type='submit'>
                {!loaderInButton ? (
                <span className='button-text'>登録</span>
                ) : (
                <LoaderInButton />
                )}
              </button>
              </div>
            </form>
          </div>
        )}
      </div>
  );
}

export default LoginAndRegister;