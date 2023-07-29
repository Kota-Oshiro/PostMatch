export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

  export const getCroppedImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const scaleX = image.width / image.naturalWidth
    const scaleY = image.height / image.naturalHeight
    const ctx = canvas.getContext('2d')
  
    canvas.width = 400 // 画像の最終的なサイズを400pxにセット
    canvas.height = 400 // 画像の最終的なサイズを400pxにセット
  
    ctx.drawImage(
      image,
      crop.x * scaleX, // ズームと位置を反映
      crop.y * scaleY, // ズームと位置を反映
      crop.width * scaleX, // ズームを反映
      crop.height * scaleY, // ズームを反映
      0,
      0,
      canvas.width,
      canvas.height,
    )
  
    return new Promise((resolve) => {
      const base64Image = canvas.toDataURL('image/jpeg');
      canvas.toBlob((blob) => {
        resolve({ croppedImageBase64: base64Image, croppedImageBlob: blob });
      }, 'image/jpeg', 1);
    })
  }
  
