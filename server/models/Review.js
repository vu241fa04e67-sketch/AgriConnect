import mongoose from 'mongoose';
const reviewSchema=new mongoose.Schema({buyerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},farmerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},orderId:{type:mongoose.Schema.Types.ObjectId,ref:'Order',required:true,unique:true},rating:{type:Number,min:1,max:5,required:true},comment:{type:String,default:''}},{timestamps:true});
export default mongoose.model('Review',reviewSchema);
