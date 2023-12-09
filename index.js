import express from "express";
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";

mongoose.connect("mongodb://localhost:27017/Backend",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>console.log("Database Connected"))
.catch((e)=>console.log(e));

const messageSchema= new mongoose.Schema({
     name:String,
     email:String,
})

const Messge= mongoose.model("Message",messageSchema);


const app=express();
const users=[];
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.set("view engine","ejs");


app.get("/",(req,res)=>{
    const {token}=req.cookies;
    if(token){
       res.render("logout");
    }
    else {
      res.render("login");
    }
})
app.get("/add",(req,res)=>{
    Messge.create({name:"Aakash", email:"rktaakash@gmail.com"}).then(()=>{
        res.send("Nice")
    });
})
app.post("/login",(req,res)=>{
    res.cookie("token","iamin",{
        httpOnly:true,
        expires:new Date(Date.now() + 60*100),
    });
    res.redirect("/")
})
app.get("/success",(req,res)=>{
    res.render("success");
})

app.post("/contact",async(req,res)=>{
    const {name, email}=req.body;
   await Messge.create({name:name, email:email});
   res.redirect("/success");
   
})

app.get("/users",(req,res)=>{
    res.json({
        users,
    })
})
app.listen(5000,()=>{
    console.log("Server is working")
})