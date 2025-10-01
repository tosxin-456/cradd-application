// signUpUtils.js
import {API_BASE_URL} from '../config/apiConfig';

export const sendOTP = async (data, setLoading, setPage, navigate, toast) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/otp/send`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status == 200) {
      const responseData = await response.json();
      const { userId } = responseData.data;
      localStorage.setItem('userId', userId);
      setLoading(false);
      setPage(2);
      console.log(userId)
      toast.success('Check mail for the OTP sent')
    } else {
      const {error} = await response.json();
      console.log(error);
      setLoading(false);
      toast.error(error);
    }
  } catch (error) {
    setLoading(false);
    console.error('An error occurred:', error);
  }
};

export const confirmOTP = async (data, setLoading, setPage, navigate, toast) => {
  setLoading(true);
  const userId = localStorage.getItem('userId');
  console.log(data);
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/otp/confirm/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      setLoading(false);
      setPage(3)
    } else {
      const {error} = await response.json();
      console.log(error);
      setLoading(false);
      toast.error(error);
    }
  } catch (error) {
    setLoading(false);
    console.error('An error occurred:', error);
    // toast.error(error);
    toast.error('A problem occurred. Try again.');
  }
};

export const resetPassword = async (data, setLoading, setPage, navigate, toast) => {
  console.log(data)
  setLoading(true);
  const userId = localStorage.getItem('userId');
  try {
    if (data.newPassword !== data.confirmNewPassword) {
      setLoading(false);
      toast.error('Passwords do not match');
      return;
    }
    const formData = {
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword
    }
    console.log(formData)

    const response = await fetch(`${API_BASE_URL}/api/user/resetPassword/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.status === 200) {
      const res = await response.json();
      setLoading(false);
      toast.success(res?.message);
      localStorage.removeItem('userId');
      navigate(`/login`);
    } else {
      const result = await response.json();
      setLoading(false);
      toast.error(result.error);
    }
  } catch (error) {
    setLoading(false);
    console.error('An error occurred:', error);
  }
};
