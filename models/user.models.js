const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {type:String, unique:true, required:true},
    first_name: String,
    last_name: String,
    email: {type:String, unique:true, required:true},
    password:{type:String, required:true},
    is_superuser: Boolean,
    is_staff: Boolean
},{
    timestamps: true
})

module.exports = mongoose.model('User', UserSchema);