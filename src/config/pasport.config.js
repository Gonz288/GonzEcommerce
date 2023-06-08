const passport = require("passport");
const local = require("passport-local");
const GitHubStrategy = require("passport-github2");
const usersModel = require("../dao/mongo/models/usersModel");
const bcrypt = require("bcrypt");
const cartModel = require("../dao/mongo/models/cartsModel");
const {logger} = require("./utils");

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
            const {firstname, lastname, email, age, confirm_password} = req.body;
            try{
                let user = await usersModel.findOne({email:username});
                if(user){
                    return done(null, false, req.flash("error","This account is already registered!"));
                }else if(!email || !firstname || !lastname || !age || !password || !confirm_password){
                    return done(null, false, req.flash("error","Missing data"));
                }else if(password !== confirm_password) return done(null,false, req.flash("error","Passwords don't match"))
                else{
                    const newCart = new cartModel();
                    await newCart.save();

                    const newUser = {
                        firstname,
                        lastname,
                        email,
                        age,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                        cartId: newCart._id
                    }

                    let result = await usersModel.create(newUser);
                    return done(null,result);
                }
            }catch(error){
                logger.error(`Failed Register: ${error}`);
                return done("Error:" + error);
            }
        }
    ));
    passport.use("login", new LocalStrategy(
        {passReqToCallback:true,usernameField: "email"}, async(req,username, password,done)=>{
        try{
            const user = await usersModel.findOne({email:username});
            if(!user)return done(null,false,req.flash("error","This account doesn't exist or your account was eliminated."));
            if(!bcrypt.compareSync(password,user.password)) return done(null, false, req.flash("error", "Your password is incorrect"));

            const saveDate = await usersModel.findOneAndUpdate({email:username}, {last_connection: new Date()});
            return done(null,user);
        }catch(error){
            logger.error(`Failed Login: ${error}`)
            return done(error);
        }
    }));
    passport.use("github", new GitHubStrategy({
        clientID:"Iv1.b0774241b6a253a5",
        clientSecret:"8875a053b00be8127d2599f048598fd838989293",
        callbackURL:"http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) =>{
        try{
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
            logger.error(`Login with Github Failed: ${error}`);
            return done(error);
        }
    }
    ));
};

module.exports = initializePassport;