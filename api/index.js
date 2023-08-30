const express = require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const User=require('./models/User')
const Post=require('./models/Post')
const bcrypt = require('bcrypt');
const app=express();
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');


// app.get('/test',(req,resp)=>{
//     resp.json('test ok2')
// })

const salt=bcrypt.genSaltSync(10);
const secret='lfkjbfkjbhdbvdwwyh8geiv';

app.use(cors({credentials:true,origin:'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname + '/uploads'))

mongoose.connect('mongodb+srv://blog:2Hc6P5yezf5gO2i5@cluster0.x2flmvv.mongodb.net/?retryWrites=true&w=majority')

app.post('/register', async (req,resp)=>{
    const {username,password}=req.body;
    try{
        const userDoc=await User.create({
            username, 
            password:bcrypt.hashSync(password,salt),
        })
        // resp.json({requestData:{username,password}});
        resp.json({userDoc})
    } catch(e){
        resp.status(400).json(e);
    }

})

app.post('/login',async (req,resp)=>{
    const {username,password}=req.body;
    const userDoc= await User.findOne({username})
    const passOk=bcrypt.compareSync(password, userDoc.password);
    //password-pwd from our request ,userDoc.password-pwd from database
    if(passOk){
        //login
        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err) throw err;
            // resp.json(token)
            resp.cookie('token', token).json({
                id:userDoc._id,
                username,
              });

        })
    }
    else{
        resp.status(400).json('wrong credentials')
    }

})

app.get('/profile',(req,resp)=>{
    const {token}=req.cookies
    jwt.verify(token,secret,{},(err,info)=>{
        if(err) throw(err);
        resp.json(info);
    })
    
})

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
  });

  app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {title,summary,content} = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
      });
      res.json(postDoc);
    });
  
  });

  app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        // .sort({createdAt: -1})
        // .limit(20)
    );
  });

  app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })
  

app.listen(4000)

//2Hc6P5yezf5gO2i5
//mongodb+srv://blog:2Hc6P5yezf5gO2i5@cluster0.x2flmvv.mongodb.net/?retryWrites=true&w=majority