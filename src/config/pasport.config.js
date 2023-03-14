const passport = require("passport");
const local = require("passport-local");
const GitHubStrategy = require("passport-github2");
const usersModel = require("../data/models/usersModel");
const bcrypt = require("bcrypt");

const LocalStrategy = local.Strategy;
const initializePassport = () =>{
    passport.serializeUser((user,done) =>{
        done(null,user.id);
    });
    passport.deserializeUser(async (id, done) =>{
        let user = await usersModel.findById(id);
        done(null, user);
    });
    passport.use("register", new LocalStrategy(
        {passReqToCallback:true, usernameField: "email"}, async(req,username,password,done)=>{
            const {firstname, lastname, email, age} = req.body;
            let {admin} = req.body;
            try{
                let user = await usersModel.findOne({email:username});
                if(user){
                    return done(null, false);
                }
                const newUser = {
                    firstname,
                    lastname,
                    admin,
                    email,
                    age,
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
                }
                let result = await usersModel.create(newUser);
                return done(null,result);
            }catch(error){
                return done("Error:" + error);
            }
        }
    ));
    passport.use("login", new LocalStrategy({usernameField: "email"}, async(username, password, done)=>{
        try{
            const user = await usersModel.findOne({email:username});
            if(!user){
                console.log("User doesn't exist");
                return done(null,false);
            }
            if(!bcrypt.compareSync(password,user.password)) return done(null, false);
            return done(null,user);
        }catch(error){
            return done(error);
        }
    }));
    passport.use("github", new GitHubStrategy({
        clientID:"Iv1.b0774241b6a253a5",
        clientSecret:"8875a053b00be8127d2599f048598fd838989293",
        callbackURL:"http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) =>{
        try{
            console.log(profile);
            let user = await usersModel.findOne({email:profile._json.email});
            if(!user){
                let newUser = {
                    firstname: profile._json.name,
                    lastname: "",
                    age: 18,
                    email:profile._json.email,
                    password: ""
                }
                let result = await usersModel.create(newUser);
                done(null, result);
            }else{
                done(null, user);
            }
        }catch(error){
            return done(error);
        }
    }
    ));
};

module.exports = initializePassport;