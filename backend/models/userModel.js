const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const userModel=mongoose.Schema({
    name:{type:String , required:true},
    email:{type:String , required:true ,unique:true},
    password:{type:String , required:true},
    pic: { type: String, default:"https://imgs.search.brave.com/AacU8xp0ygbsYNFeJwPIkIivukoXro2sBqPKytTLVy8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNy8w/Ny8xOC8yMy8yMy9n/cm91cC0yNTE3NDI3/XzY0MC5wbmc"}
},{
    timestamps: true,
})
userModel.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userModel.pre("save", async function (next) {
    if (!this.isModified) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


const User=mongoose.model('User',userModel)
module.exports=User