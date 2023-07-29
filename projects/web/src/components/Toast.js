import React, { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './Toast.css';

function Toast({ id, message, type }) {

  useEffect(() => {
    switch(type) {
      case 'success':
        Success();
        break;
      case 'error':
        Error();
        break;
      case 'postSuccess':
        PostSuccess();
        break;
      case 'delete':
        Delete();
        break;
      default:
        if (process.env.NODE_ENV !== 'production') {
          console.log('Invalid type');
        }
    }
  }, [id, message, type]);

  const Success = () => toast.success(message, {
    style: {
      background: '#3465FF',
      color: '#fff',
    },
  });

  const Error = () => toast.error(message);

  const PostSuccess = () => toast(message, {
    icon: '👏',
    style: {
      background: '#3465FF',
      color: '#fff',
    },
    duration: 2000,
  });

  const Delete = () => toast(message, {
    style: {
      background: '#242424',
      color: '#fff',
    },
    duration: 2000,
  });

  return (
    <Toaster
      toastOptions={{
        className: 'toast',
      }}
    />
  );
}

export default Toast
