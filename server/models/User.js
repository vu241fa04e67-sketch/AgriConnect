import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true}, phone:{type:String,default:''}, role:{type:String,enum:['Farmer','Buyer','Admin'],default:'Buyer'},
  isVerified:{type:Boolean,default:false}, farmName:{type:String,default:''}, location:{type:String,default:''}, address:{type:String,default:''}
},{timestamps:true});
export default mongoose.model('User',userSchema);
