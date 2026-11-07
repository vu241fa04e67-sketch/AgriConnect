import bcrypt from 'bcryptjs';import jwt from 'jsonwebtoken';import User from '../models/User.js';
const makeToken=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'});
export async function register(req,res){try{const {name,email,password,phone,role='Buyer',farmName='',location='',address=''}=req.body;
 if(!name||!email||!password)return res.status(400).json({message:'Name, email and password are required'});if(password.length<8)return res.status(400).json({message:'Password must contain at least 8 characters'});
 if(!['Farmer','Buyer'].includes(role))return res.status(400).json({message:'Invalid registration role'});if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});
 const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),phone,role,farmName,location,address});res.status(201).json({token:makeToken(user._id),user:{id:user._id,name:user.name,email:user.email,role:user.role,isVerified:user.isVerified}});
 }catch(e){res.status(500).json({message:'Registration failed',error:e.message});}}
export async function login(req,res){try{const {email,password}=req.body;const user=await User.findOne({email});if(!user||!await bcrypt.compare(password||'',user.passwordHash))return res.status(401).json({message:'Invalid email or password'});
 res.json({token:makeToken(user._id),user:{id:user._id,name:user.name,email:user.email,role:user.role,isVerified:user.isVerified,farmName:user.farmName,location:user.location}});
 }catch(e){res.status(500).json({message:'Login failed'});}}
export async function me(req,res){res.json({user:req.user});}
