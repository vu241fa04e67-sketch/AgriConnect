import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function protect(req,res,next){
 try{const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.split(' ')[1]:null;if(!token)return res.status(401).json({message:'Authentication required'});
 const decoded=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(decoded.id).select('-passwordHash');if(!req.user)return res.status(401).json({message:'Account not found'});next();}
 catch(e){return res.status(401).json({message:'Invalid or expired token'});}
}
export const allow=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'You do not have permission for this action'});
