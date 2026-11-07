import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
 buyerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true}, farmerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 cropId:{type:mongoose.Schema.Types.ObjectId,ref:'Crop',required:true}, cropName:{type:String,required:true}, quantity:{type:Number,required:true,min:0.01},
 unit:{type:String,enum:['kg','quintal'],required:true}, unitPriceAtOrder:{type:Number,required:true}, totalAmount:{type:Number,required:true},
 deliveryAddress:{type:String,required:true}, contactPhone:{type:String,required:true},
 orderStatus:{type:String,enum:['Pending','Accepted','Rejected','Fulfilled','Cancelled'],default:'Pending'}
},{timestamps:true});
export default mongoose.model('Order',orderSchema);
