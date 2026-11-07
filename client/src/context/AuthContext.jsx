import {createContext,useContext,useState} from 'react';import api from '../services/api';
const AuthContext=createContext(null);
export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('agri_user'))}catch{return null}});
 async function login(credentials){const {data}=await api.post('/auth/login',credentials);localStorage.setItem('agri_token',data.token);localStorage.setItem('agri_user',JSON.stringify(data.user));setUser(data.user);return data.user;}
 async function register(values){const {data}=await api.post('/auth/register',values);localStorage.setItem('agri_token',data.token);localStorage.setItem('agri_user',JSON.stringify(data.user));setUser(data.user);return data.user;}
 function logout(){localStorage.removeItem('agri_token');localStorage.removeItem('agri_user');setUser(null)}
 return <AuthContext.Provider value={{user,login,register,logout}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
