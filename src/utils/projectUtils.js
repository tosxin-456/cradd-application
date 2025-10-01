import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import {API_BASE_URL} from '../config/apiConfig';
import { Toaster, toast } from 'sonner'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const updateProject = async (completedPhases,projectType,setLoading,navigate) => {
  setLoading(true);
  console.log("Updating project...");
  const access_token = localStorage.getItem('access_token');
  const decodedToken = jwtDecode(access_token);
  const userId = decodedToken.userId;


  const projectId = localStorage.getItem('nProject');
  const data = {
    projectType,
    phases: completedPhases.map(phase => phase.title),
  };

  try {
    console.log("Request data:", data);

    const response = await fetch(`${API_BASE_URL}/api/project/type/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      const responseData = await response.json();
      console.log('Response:', responseData);

      toast.success('Project updated successfully!');
      setLoading(false);
      navigate('/welcome-form');

    } else {
      const result = await response.json();
      console.error('Error:', result.error);
      toast.error(result.error);
      setLoading(false);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    toast.error('An unexpected error occurred.');
    setLoading(false);
  }
};

export default updateProject;