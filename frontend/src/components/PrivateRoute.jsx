import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, isAdmin }) => {
  const token = localStorage.getItem('token');
  const userIsAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!token) return <Navigate to="/login" />;
  if (isAdmin && !userIsAdmin) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;