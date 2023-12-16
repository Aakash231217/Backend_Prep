import express from "express";
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


mongoose.connect("mongodb://localhost:27017/Backend", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

const app = express();
const users = [];

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (token) {
      const decoded = jwt.verify(token, "asadwedswerdserd");
      req.user = await User.findById(decoded._id);
    } else {
      return res.render("login");
    }
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.render("login");
  }
  next();
};

app.get("/", isAuthenticated, (req, res) => {
  console.log(req.user);
  res.render("logout",{name:req.user.name});
});

app.get("/register", async(req,res)=>{
  const { name, email, password } = req.body;
  let user= await User.findOne({email});
  if(!user){
    return res.redirect("/login");
  }
  const hashedPassword= await bcrypt.hash(password,10);
  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  const token = jwt.sign({ _id: user._id }, "asadwedswerdserd");
  console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000), // Adjust the expiration time as needed
  });
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const { name, email } = req.body;
 
  let user= await User.findOne({email});
  if(!user){
    return res.redirect("/register");
  }
  user = await User.create({
    name,
    email,
  });
  const token = jwt.sign({ _id: user._id }, "asadwedswerdserd");
  console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000), // Adjust the expiration time as needed
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()), // Set the expiration time to a date in the past
  });
  res.redirect("/");
});

app.get("/users", (req, res) => {
  res.json({
    users,
  });
});

app.listen(5000, () => {
  console.log("Server is working");
});
