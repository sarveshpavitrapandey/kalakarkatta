import { createContext, useReducer, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
      return { user: null };
    case 'UPDATE_STATUS':
      return { user: { ...state.user, availabilityStatus: action.payload } };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      const userId = state.user.user ? state.user.user._id : state.user._id;
      newSocket.emit('register', userId);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, dispatch, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
