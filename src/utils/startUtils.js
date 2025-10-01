import { useEffect } from "react";
import { API_BASE_URL } from '../config/apiConfig';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export const handleClick = (url) => {
  window.location.href = url;
};

export const handleClickStorage = (selectedCase, url) => {
  localStorage.setItem('selectedCase', selectedCase);
  window.location.href = url;
};

// Function to handle logout
export const handleLogout = () => {
  const preservedKeys = ['username', 'password', 'rememberMe'];
  Object.keys(localStorage).forEach((key) => {
    if (!preservedKeys.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  window.location.href = '/login';
};

export const handleLogoutLanding = () => {
  localStorage.clear();
  window.location.href = '/login';
};


// Function to handle home redirection
export const handleHome = () => {
  window.location.href = '/home';
};

// Update Streak
export const updateStreak = async (setStreak) => {
  try {
    const token = localStorage.getItem('access_token');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;
    const projectId = localStorage.getItem('nProject');

    const response = await axios.post(`${API_BASE_URL}/api/streak/`, { userId, projectId });
    setStreak(response.data.streak);
  } catch (error) {
    console.log(error.response);
  }
};

export const CheckOnboarding = async () => {
  try {
    // Fetch access token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Access token is missing");
    }
    // console.log(userId, token)
    // Decode token to extract user ID
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.userId;
    if (!userId) {
      throw new Error("User ID is missing in token");
    }

    // Fetch project ID from localStorage
    const projectId = localStorage.getItem("nProject");
    if (!projectId) {
      throw new Error("Project ID is missing");
    }

    // Make API request to fetch onboarding statuses
    const response = await fetch(
      `${API_BASE_URL}/api/onboarding/picked/${projectId}/${userId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch onboarding statuses");
    }

    // Parse response data
    const data = await response.json();
    console.log(data);

    // Save onboarding statuses to localStorage
    if (data?.onboardingStatuses) {
      localStorage.setItem("onboarding", JSON.stringify(data.onboardingStatuses));
    } else {
      console.warn("onboardingStatuses not found in the response.");
    }
  } catch (error) {
    console.error("Error during onboarding check:", error);
  }
};

// Decode JWT token and get user ID
export const getUserIdFromToken = () => {
  const access_token = localStorage.getItem('access_token');

  if (access_token) {
    try {
      const decodedToken = jwtDecode(access_token);
      const userId = decodedToken?.userId || null;
      return { access_token, userId };
    } catch (error) {
      console.error('Invalid token:', error.message);
      return { access_token: null, userId: null };
    }
  }

  return { access_token: null, userId: null };
};

export const FetchProjectDetails = (projectId, setProjectDetails, setError, setLoading) => {
  useEffect(() => {
    const fetchProjectDetails = async () => {
      console.log("getting details")
      const id = projectId;
      console.log("getting details:" + id)
      try {
        const response = await fetch(`${API_BASE_URL}/api/project/project/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          const responseData = await response.json();
          console.log('Response:', responseData.data.phases);
          setProjectDetails(responseData.data.phases);
        } else {
          const result = await response.json();
          console.error('Error:', result.error);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, setProjectDetails, setError, setLoading]);
};

export const CreateTellUs = async (feedbackData, setResponse, setError, setLoading) => {
  try {
    console.log("Submitting feedback...");
    console.log("Feedback Data:", feedbackData);

    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/tellus`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Feedback Response:', responseData);
      setResponse(responseData);
    } else {
      const errorData = await response.json();
      console.error('Error:', errorData);
      setError('Something went wrong.');
    }
  } catch (error) {
    console.error('Network Error:', error);
    setError(error.message || 'Network Error');
  } finally {
    setLoading(false); // End loading state
  }
};

export const FetchUser = (userId, setUserDetails, setError, setLoading) => {
  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log("getting details")
      const id = userId;
      console.log("getting details:" + id)
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          const responseData = await response.json();
          console.log('Response:', responseData);
          setUserDetails(responseData);
        } else {
          const result = await response.json();
          console.error('Error:', result.error);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, setUserDetails, setError, setLoading]);
};

// utils/startUtils.js
export const FetchUserNda = async (userId, token, setUserDetails) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      setUserDetails(data); // Use callback
      return;
    } else {
      const result = await response.json();
      throw new Error(result.error || 'Failed to fetch user');
    }
  } catch (error) {
    throw error;
  }
};



export const FetchGoStatus = (projectId, access_token, setUnlock, setUnlockIn) => {
  useEffect(() => {
    // Define an async function to fetch goStatus data
    const fetchGoStatus = async () => {
      try {
        // Make API request to check goStatus with Bearer token
        const response = await fetch(`${API_BASE_URL}/api/project/go/${projectId}/Ideation/Approved`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`, // Include Bearer token
            'Content-Type': 'application/json'
          }
        });
        console.log("here")
        // Check if the response status is 200
        if (response.status === 200) {
          console.log("here status")

          const data = await response.json();
          console.log("go status");
          console.log(data.message);
          console.log(data.allCompleted);
          setUnlock(data.allCompleted);
          setUnlockIn(data.allCompleted);
        } else {
          const data = await response.json();
          console.log(data.message);
          console.log('Failed to fetch goStatus. Please try again later.');
        }
      } catch (err) {
        console.log('An error occurred while checking goStatus.', err);
      } finally {
        //setLoading(false);
      }
    };

    // Call the async function
    fetchGoStatus();
  }, [projectId, access_token, setUnlock, setUnlockIn]);
};

export const FetchTimelines = (projectId, setTimelines, setLoading, setError) => {
  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const response = await axios.get(API_BASE_URL + `/api/algo/${projectId}`);
        console.log(response);
        setTimelines(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchTimelines();
  }, [projectId, setTimelines, setLoading, setError]);
};

export const updateOnboardingStatus = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    const response = await axios.patch(`${API_BASE_URL}/api/onboarding/${userId}`, { onboarding: true }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === 200) {
      localStorage.setItem('onboarding', 'true')
    }
  } catch (error) {
    console.error(error.response || error.message);
  }
};

export const FetchTimelinesCount = (projectId, userId, access_token, setTimelineCount, setLoading, setError) => {
  useEffect(() => {
    const fetchTimelinesCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/timeline/count/projects/${userId}/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          console.log(data.count);
          setTimelineCount(data.count);
          setLoading(false);

        } else {
          console.error('Failed count');
        }

      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchTimelinesCount();
  }, [projectId, userId, access_token, setTimelineCount, setLoading, setError]);
};


export const UpdateOnboardingSeenStatus = async (projectId, userId, access_token, setError, phase) => {
  try {
    if (!projectId || !userId || !access_token || !phase) {
      throw new Error("Missing required parameters for updating onboarding status.");
    }

    console.log("Updating onboarding status for:", { projectId, userId, phase });

    const response = await fetch(
      `${API_BASE_URL}/api/onboarding/${projectId}/${userId}/${phase}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update onboarding status");
    }

    const data = await response.json();
    console.log("Onboarding status updated:", data);
    const onboarding = JSON.parse(localStorage.getItem("onboarding") || "{}");
    onboarding[phase] = true; // Update the 'seen' status for the specified phase
    localStorage.setItem("onboarding", JSON.stringify(onboarding));
  } catch (error) {
    console.error("Error updating onboarding status:", error.message);
    setError(error);
    throw error;
  }
};




// startUtils.js
export const FetchGraphData = async (userId, projectId, access_token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/graph/${userId}/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch graph data');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error;
  }
};

export const FetchGraphDataValidate = async (userId, projectId, access_token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/graph-validate/${userId}/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch graph data');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error;
  }
};

export const FetchGraphDataProduct = async (userId, projectId, access_token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/graph-product/${userId}/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch graph data');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error;
  }
};

export const FetchGraphDataDesign = async (userId, projectId, access_token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/graph-design/${userId}/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch graph data');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error;
  }
};

export const FetchGraphDataCommerce = async (userId, projectId, access_token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/graph-commerce/${userId}/${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch graph data');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error;
  }
};

export const fetchUnansweredQuestions = async (category, subCategoryPassed, projectId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/new/questions/${category}/${subCategoryPassed}/${projectId}`
    );

    if (response.ok) {
      const data = await response.json();
      return data?.data?.options ? [data.data] : [];
    } else {
      throw new Error("Failed to fetch questions.");
    }
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

