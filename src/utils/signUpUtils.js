// signUpUtils.js
import { API_BASE_URL } from '../config/apiConfig';
import { toast } from 'sonner';

export const handleTogglePassword = (showPassword, setShowPassword) => {
  setShowPassword(!showPassword);
};

export const handleToggleCPassword = (showCPassword, setShowCPassword) => {
  setShowCPassword(!showCPassword);
};

export const validatePassword = (password, setPasswordValid) => {
  const length = password.length >= 8;
  const number = /\d/.test(password);
  const capital = /[A-Z]/.test(password);
  const special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  setPasswordValid({ length, number, capital, special });
};

// function getJavaScriptVersion() {
//   if (typeof Symbol === 'function') return 'ES6+';
//   if (typeof Map === 'function') return 'ES6';
//   if (typeof JSON === 'object') return 'ES5';
//   if (typeof ActiveXObject === 'function') return 'ES3'; // IE 6-8
//   return 'Unknown';
// }

// const jsVersion = getJavaScriptVersion();

export const createUser = async (data, referralCode, setLoading, toast, navigate) => {
  const unsupportedVersionMessage =
    'Your browser is most likely outdated and may not support modern features required for this application. Please consider using a different  browser such as Chrome, Firefox, Edge, or Safari.';

  // Check if the JavaScript version is less than ES5
  // if (jsVersion === 'ES3' || jsVersion === 'Unknown') {
  //   toast.error(unsupportedVersionMessage, {
  //     autoClose: false, 
  //   });
  //   return;
  // }

  setLoading(true);
  try {
    // if (data.password !== data.cpassword) {
    //   setLoading(false);
    //   toast.error('Passwords do not match');
    //   return;
    // }
    console.log(data)
    const response = await fetch(`${API_BASE_URL}/api/user/${referralCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data }),
    });

    if (response.status === 200) {
      const responseData = await response.json();
      const { access_token, id } = responseData.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('id', id);
      setLoading(false);
      navigate(`/confirm-email`);
    } else {
      const result = await response.json();
      setLoading(false);
      toast.error(result.error);
    }
  } catch (error) {
    setLoading(false);
    console.log('An error occurred:', error);
    toast.error(`An error occurred: ${String(error?.message || error)}`);
  }
};

