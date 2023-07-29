import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from './UserEditGetCropImage'

import './UserEditCropper.css';

const UserEditCropper = ({ image, handleCroppedImage, isCropperVisible, setIsCropperVisible}) => {

  const [crop, setCrop] = useState({ x: 0, y: 0})
  const [cropShape, setcropShape] = useState('round')
  const [cropSize, setcropSize] = useState({ width: 320, height: 320 })

  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [base64Image, setBase64Image] = useState('')

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // 戻るボタン
  const handleCancel = () => {
    setIsCropperVisible(false);
  };

  // クロップ結果を処理
  const handleCropperResult = async () => {
    try {
      const { croppedImageBase64, croppedImageBlob } = await getCroppedImg(
        image,
        croppedAreaPixels
      )
      setBase64Image(croppedImageBase64)
      handleCroppedImage({base64: croppedImageBase64, blob: croppedImageBlob});  // 親コンポーネントにデータを渡す
      setIsCropperVisible(false);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error cropping image:', error);
      }
    }
  }

    return (
      <>
        <div className='edit-cropper-header'>
            <span className='edit-cropper-text'>画像を調整</span>
        </div>
        <div className='edit-cropper-wrapper'>
            <Cropper
            image={image}
            crop={crop}
            cropShape={cropShape}
            cropSize={cropSize}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className='edit-cropper-footer'>
            <div className='edit-cropper-cancel' onClick={handleCancel}>戻る</div>
            <div className='edit-cropper-apply' onClick={handleCropperResult}>適用</div>
        </div>
      </>
    )
}

export default UserEditCropper;
