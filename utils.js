const jwt = require("jsonwebtoken");

const PRIVATE_KEY = "CoderKey";

const generateToken = (user) =>{
    const token = jwt.sign({user}, PRIVATE_KEY,{expiresIn:"24h"});
    return token;
};

const authToken = (req,res,next) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).send({error:"Nout authenticated"});
    const token = authHeader.split(" ")[1];

    jwt.verify(token, PRIVATE_KEY, (error, credentials) =>{
        if(error) return res.status(403).send({error:"Nout authorized"});
        req.user = credentials.user;
        next();
    })
};