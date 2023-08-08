import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import './UserEdit.css';
import { ReactComponent as CameraIcon } from '../icons/camera.svg';
import UserEditCropper from './UserEditCropper';

import { Loader, LoaderInButton } from './Loader';

import { AuthContext } from '../AuthContext';

function UserEditForm() {
  
  const { isAuthenticated, currentUser, apiBaseUrl, updateSupportTeam, updateUserImg } = useContext(AuthContext);
  const navigation = useNavigate();

  const [loadingAccountEdit, setLoadingAccountEdit] = useState(true);
  const [loaderInButton, setLoaderInButton] = useState(false);
  const [isCropperVisible, setIsCropperVisible] = useState(false);

  const [account, setAccount] = useState({});
  const [initialAccount, setInitialAccount] = useState({}); //更新があった箇所を比較するために初期状態を保存
  const [teams, setTeams] = useState([]);

  const [image, setImage] = useState('');
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [supportTeam, setSupportTeam] = useState('');
  const [supportedAtYear, setSupportedAtYear] = useState('');
  const [supportedAtMonth, setSupportedAtMonth] = useState('');

  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const [twitterId, setTwitterId] = useState('');
  const [errorTwitterId, setTwitterIdError] = useState('');
  
  const inputRef = useRef();
  
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [supportTeamError, setSupportTeamError] = useState(null);
  const [supportYearError, setSupportYearError] = useState(null);
  const [supportMonthError, setSupportMonthError] = useState(null);

  useEffect(() => {
    const loadingAccountEdit = async () => {
      try {
        if(isAuthenticated && currentUser) {
          apiBaseUrl.get(`/user/${currentUser.id}/edit/`)
          .then(response => {
              const data = response.data;
              // アカウントデータの取得
              setAccount(data);
              setCroppedImage(data.profile_image);
    
              // UI用にsupported_atを分割
              if (data.supported_at) {
                let supportedAt = new Date(data.supported_at);
                setSupportedAtYear(supportedAt.getFullYear());
                setSupportedAtMonth(supportedAt.getMonth() + 1);  // getMonth() is 0-indexed
                setInitialAccount({
                  ...data,
                  support_team: data.support_team,
                  supported_at: supportedAt.toISOString()
                });
              } else {
                setSupportedAtYear(null);
                setSupportedAtMonth(null);
                setInitialAccount({
                  ...data,
                  support_team: data.support_team,
                  supported_at: null
                });
              }
    
              // 各テキストデータの初期表示セット
              if (data.name) setName(data.name);
              if (data.support_team) setSupportTeam(data.support_team);
              if (data.description) setDescription(data.description);
              if (data.twitter_id) setTwitterId(data.twitter_id);
    
              setLoadingAccountEdit(false);
            })
            .catch(error => {
              if (process.env.NODE_ENV !== 'production') {
                console.error("Error fetching user data:", error);
              }
            });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Error in loadingAccountEdit function:", error);
        }
      }
    };
    
  
    loadingAccountEdit();
  }, [isAuthenticated, currentUser]);
  
  useEffect(() => {
    apiBaseUrl.get(`/user/edit/teams/`)
      .then(response => {
        setTeams(response.data);
      })
      .catch(error => {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Error fetching user data:", error);
        }
        setErrorMessage("チームデータの取得に失敗しました");
      });
  }, []);

  useEffect(() => {
    if (isCropperVisible) {
      // モーダルが開いている時はスクロールを無効にする
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じている時はスクロールを有効にする
      document.body.style.overflow = 'visible';
    }

    return () => {
      // コンポーネントがアンマウントされたときはスクロールを再度有効にする
      document.body.style.overflow = 'visible';
    };
  }, [isCropperVisible]);


  // カメラアイコンをクリックするとファイルダイアログを開く
  const handleCropper = () => {
    inputRef.current.click();
  };

  // 画像を選択したときにクロッパ―コンテナを表示し、画像データを子コンポーネント（クロッパー）に渡す
  const handleImageChange = e => {
    const reader = new FileReader();
    reader.onload = function (event) {
      setIsCropperVisible(true);
      setImage(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  // クロッパ―（子要素）からクロップ画像を受け取る
  const handleCroppedImage = async (imageData) => {
    setCroppedImage(URL.createObjectURL(imageData.blob)); // UI表示用
    setCroppedImageBlob(imageData.blob); // 送信用
  };

  //テキスト情報のハンドル
  const handleInputChange = (setter, setError, maxLength) => (event) => {
    const val = event.target.value;
    if (val.length <= maxLength) {
      setter(val);
      setError('');
    } else {
      setError(`${maxLength}文字以内で入力してください`);
    }
  };

  //バリデーションチェック
  const validateForm = () => {
    let isValid = true;

    if (!supportTeam && (supportedAtYear || supportedAtMonth)) {
      setSupportTeamError('応援しているチームを選択してください');
      isValid = false;
    }

    if (supportTeam && !supportedAtYear && supportedAtMonth) {
      setSupportYearError('年を選択してください');
      isValid = false;
    }

    if (supportTeam && supportedAtYear && !supportedAtMonth) {
      setSupportMonthError('月を選択してください');
      isValid = false;
    }
        
    return isValid;
  };

  const submitForm = async () => {  // 非同期関数として定義

    const formData = new FormData();
  
    if (initialAccount.profile_image !== croppedImage) {
      formData.append('profile_image', croppedImageBlob, 'profile_image.jpg');
    }
    
    formData.append('name', name);
    formData.append('support_team', supportTeam);
  
    if (initialAccount.description !== description) {
      formData.append('description', description);
    }
  
    if (initialAccount.twitter_id !== twitterId) {
      formData.append('twitter_id', twitterId);
    }
  
    // 分割した年月を送信時にISO形式で送信
    let updatedSupportedAt = initialAccount.supported_at;
  
    if (supportTeam && supportedAtYear && supportedAtMonth) {
      updatedSupportedAt = new Date(supportedAtYear, supportedAtMonth - 1, 1).toISOString();
    } else {
      updatedSupportedAt = '1800-01-01T00:00:00.000Z'; // 初期値を1800年に設定
    }
  
    formData.append('supported_at', updatedSupportedAt);
  
    apiBaseUrl.put(`/user/${currentUser.id}/edit/`, formData)
    .then(response => {
      setAccount(response.data);
      updateSupportTeam(response.data.support_team) //AuthContextへ渡す
      updateUserImg(response.data.profile_image) //AuthContextへ渡す
      navigation(`/user/${currentUser.id}`,{state: { from: 'userEdit', message: '更新が完了しました', type: 'success' }});
      setLoaderInButton(false)
    })
    .catch(error => {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error putting user data:", error);
      }
      navigation(`/user/${currentUser.id}`,{state: { from: 'userEdit', message: '更新に失敗しました', type: 'error' }});
      setLoaderInButton(false)
    })
    .finally(() => {
      setLoaderInButton(false)
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
  
    setLoaderInButton(true)
  
    const isValid = validateForm();
    if (isValid) {
      submitForm();
    } else {
      setLoaderInButton(false)
    }
  };

  if (loadingAccountEdit) {
    return <Loader />;
  }

  return (
    <>
    <div className="bg"></div>
    <div className={`edit-cropper-container ${isCropperVisible ? '' : 'hidden'}`} tabIndex="-1">
      <UserEditCropper image={image} setImage={setImage} handleCroppedImage={handleCroppedImage} isCropperVisible={isCropperVisible} setIsCropperVisible={setIsCropperVisible} />
    </div>
    <div className={`cropper-overlay${isCropperVisible ? '' : 'hidden'}`}></div>
    <div className="edit-container">
      <form onSubmit={handleSubmit}>
        <div className="edit-image">
          <div className="edit-image-mat" onClick={handleCropper}></div>
          <input type="file" accept=".jpg,.jpeg,.png"  ref={inputRef} style={{ display: 'none' }} onChange={handleImageChange}/>
          <img
            src={croppedImage ?
              croppedImage
              : (account.profile_image ? account.profile_image
              : "https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/media/user-default.webp"
            )}
            className="edit-image-control" alt="プロフィール画像"
          />
          <CameraIcon className="edit-icon" />
        </div>
        <div className="form-group">
          <label htmlFor="name">ユーザー名</label>
          <input
            type="text"
            name="name"
            value={name}
            placeholder="サッカー太郎"
            onChange={handleInputChange(setName, setNameError, 20)}
            required
          />
          <label htmlFor="support_team">応援しているチーム</label>
          <select onChange={event => setSupportTeam(event.target.value)}>
            {account.support_team && <option value={supportTeam}>{account.support_team_name_ja}</option> }
            <option value="">--------</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name_ja}</option>
            ))}
          </select>
          {supportTeamError && <div className='error-message'>{supportTeamError}</div>}
          <label htmlFor="supported_at">いつから応援してる？</label>
          <div className="edit-year-month">
            <select className="edit-year" onChange={event => setSupportedAtYear(event.target.value)}>
              {account.supported_at && <option value={supportedAtYear}>{supportedAtYear}</option> }
              <option value="">----</option>
              {[...Array(100)].map((_, i) => (
                <option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
              ))}
            </select>            
            <span>年</span>
            <select className="edit-month" onChange={event => setSupportedAtMonth(event.target.value)}>
              {account.supported_at && <option value={supportedAtMonth}>{supportedAtMonth}</option> }
              <option value="">--</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span>月</span>            
          </div>
          {supportYearError && <div className='error-message'>{supportYearError}</div>}
          {supportMonthError && <div className='error-message'>{supportMonthError}</div>}
          <label htmlFor="description">自己紹介</label>
          <textarea
            value={description}
            placeholder="応援しているチームの好きなところやあなたのサッカー好きが伝わる自己紹介を書こう！"
            onChange={handleInputChange(setDescription, setDescriptionError, 900)}></textarea>
          <label htmlFor="twtter_id">ツイッターID</label>
          <input
            type="text"
            value={twitterId}
            placeholder="postmatch_jp"
            onChange={handleInputChange(setTwitterId, setTwitterIdError, 15)} />
        </div>
        <button type="submit">
          {!loaderInButton ? (
          <span className='button-text'>更新</span>
          ) : (
          <LoaderInButton />
          )}
        </button>
      </form>
    </div>
  </>
    );
}

export default UserEditForm;