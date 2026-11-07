import mongoose from 'mongoose';
const cropSchema = new mongoose.Schema({
 farmerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true}, cropName:{type:String,required:true,trim:true},
 category:{type:String,required:true}, quantityAvailable:{type:Number,required:true,min:0}, unit:{type:String,enum:['kg','quintal'],default:'kg'},
 pricePerUnit:{type:Number,required:true,min:0}, description:{type:String,default:''}, imageUrl:{type:String,default:''},
 status:{type:String,enum:['Active','Inactive'],default:'Active'}
},{timestamps:true});
cropSchema.index({cropName:'text',category:'text',description:'text'});
export default mongoose.model('Crop',cropSchema);
