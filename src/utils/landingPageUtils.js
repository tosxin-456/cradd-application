import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {API_BASE_URL} from '../config/apiConfig';
import {jwtDecode} from 'jwt-decode';

// Token validation logic
export const useValidateToken = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    const isTokenInvalid = (token) => {
      if (!token) return true;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        return payload.exp && payload.exp < currentTime;
      } catch (error) {
        return true;
      }
    };

    if (isTokenInvalid(token)) {
      localStorage.removeItem('access_token');
      navigate('/login');
    }
    }, [navigate]);
  };

// Fetch user projects
export const useFetchUserProjects = (userId, setProjects) => {
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/project/${userId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          // console.log(data)
          setProjects(data.data);
        } else {
          console.error('Error fetching user projects:', await response.json());
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserProjects();
  }, [userId, setProjects]);
};

// Fetch team projects
export const useFetchTeamProjects = (userId, setTeamMembers) => {
  useEffect(() => {
    const fetchTeamProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/team/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          setTeamMembers(data.data);
        } else {
          console.error('Error fetching team projects:', await response.json());
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchTeamProjects();
  }, [userId, setTeamMembers]);
};

// Fetch review projects
export const useFetchReviewProjects = (userId, setReviewProjects) => {
  useEffect(() => {
    const fetchReviewProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/share/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          setReviewProjects(data.data);
        } else {
          console.error('Error fetching review projects:', await response.json());
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchReviewProjects();
  }, [userId, setReviewProjects]);
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const dayWithSuffix = day + getDaySuffix(day);

  return `${dayWithSuffix} ${month} ${year}`;
};

// Decode JWT token and get user ID
export const getUserIdFromToken = () => {
  const access_token = localStorage.getItem('access_token');
  if (access_token == null) {
    return access_token;
  }
  const decodedToken = jwtDecode(access_token);
  return decodedToken.userId;
};
