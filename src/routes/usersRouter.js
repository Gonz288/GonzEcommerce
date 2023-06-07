const express = require("express");
const usersModel = require("../dao/mongo/models/usersModel");
const usersRouter = express.Router();
const multer = require('multer');
const fs = require("fs");

const storageProfile = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './src/public/img/profiles');
    },
    filename: function(req,file,cb){
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
    }
});
const storageDocuments = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './src/public/img/documents');
    },
    filename: function(req,file,cb){
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
    }
});
const uploadProfile = multer({storage: storageProfile}).single("img");
const uploadDocuments = multer({storage: storageDocuments}).array("documents", 5);

usersRouter.get("/", async(req,res)=>{
    if(req.session.user.admin){
        const users = await usersModel.find({},{
            _id: 1,
            firstname: 1,
            lastname: 1,
            age: 1,
            email: 1,
            premium: 1,
            admin: 1,
            documents: 1,
            last_connection: 1
        });
        res.status(200).render("users.handlebars", {users});
    }else{  
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.get("/user/:uid", async(req,res)=>{
    if(req.session.user.admin){
        const { uid } = req.params;
        const userDB = await usersModel.findById(uid,{
            _id: 1,
            firstname: 1,
            lastname: 1,
            age: 1,
            email: 1,
            premium: 1,
            admin: 1,
            documents: 1,
            last_connection: 1
        });
        res.status(200).render("userId.handlebars", {userDB});
    }else{  
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.post("/profile", uploadProfile, async (req,res)=>{
    if(req.session.user){
        try{
            const {firstname,lastname} = req.body;
            let img;
            if(req.file) img = `/img/profiles/${req.file.filename}`;
            const dbUser = await usersModel.findByIdAndUpdate(
                { _id: req.session.user._id },
                { firstname, lastname, img}, 
                { new:true }
            );
            req.session.user.firstname = firstname;
            req.session.user.lastname = lastname;
            res.status(200).render("profile", {dbUser})
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.post("/profile/uploadDocuments", uploadDocuments, async(req,res)=>{
    if(req.session.user){
        try{
            const user = await usersModel.findById(req.session.user._id);
            let documents = user.documents;
            if(req.files){
                for(const document of req.files){
                    let reference = `/img/documents/${document.filename}`;
                    let name = document.originalname;
                    documents.push({name, reference});
                }
            }
            const dbUser = await usersModel.findByIdAndUpdate(
                { _id: req.session.user._id },
                { documents }, 
                { new:true }
            );
            req.flash("success",`The document was uploaded successfully`);
            res.status(200).redirect("/api/users/profile");
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.delete("/profile/deleteDocument/:did", async(req,res)=>{
    if(req.session.user){
        try{
            const { did } = req.params;
            const user = await usersModel.findById(req.session.user._id);
            let documents = user.documents;
            let urlDelete
            const newDocuments = documents.filter(document => { 
                if(document._id.toString() === did){
                    urlDelete = document.reference
                    return false;
                }
                return true;
            });
            fs.unlink(`./src/public/${urlDelete}`, (error) => {
                if (error) {
                    logger.error("couldn't delete document:", error);
                    req.flash("error",`Internal Server Error, couldn't delete document`);
                    res.status(500).redirect("/api/users/profile");
                    return;
                }
            });
            const dbUser = await usersModel.findByIdAndUpdate(
                { _id: req.session.user._id },
                { documents: newDocuments }, 
                { new:true }
            );
            req.flash("success",`The document was deleted successfully`);
            res.status(200).redirect("/api/users/profile");
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/users/profile");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.get("/profile", async (req,res)=>{
    if(req.session.user){
        try{
            const dbUser = await usersModel.findById(req.session.user._id);
            res.status(201).render("profile",{dbUser});
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.post("/premium/:uid", async(req,res) =>{
    if(req.session.user.admin){
        const { uid } = req.params;
        const { premium } = req.body;
        try{
            const user = await usersModel.findById(uid);
            if(premium === "false"){
                user.premium = premium;
                const saveUser = await usersModel.findByIdAndUpdate(uid, user);
                req.flash("success",`User's premium status has been changed`);
                res.status(200).redirect("/api/products");
            }else{
                if(user.documents.length >= 3){
                    user.premium = premium;
                    const saveUser = await usersModel.findByIdAndUpdate(uid, user);
                    req.flash("success",`User's premium status has been changed`);
                    res.status(200).redirect("/api/products");
                }else{
                    req.flash("error",`The user hasn't uploaded corresponding documents`);
                    res.status(401).redirect("/api/products");
                }
            }
        }catch(error){
            req.flash("error",`Internal Server Error, could not change premium status`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.post("/admin/:uid", async(req,res) =>{
    if(req.session.user.admin){
        const { uid } = req.params;
        const { admin } = req.body;
        try{
            const user = await usersModel.findById(uid);
            user.admin = admin;
            const saveUser = await usersModel.findByIdAndUpdate(uid, user);
            req.flash("success",`User's admin status has been changed`);
            res.status(200).redirect("/api/products");
        }catch(error){
            req.flash("error",`Internal Server Error`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

usersRouter.get("/logout", async(req,res) =>{
    const saveDate = await usersModel.findOneAndUpdate(req.session.user._id, {last_connection: new Date()});
    req.session.destroy();
    res.status(200).redirect("/login");
});

usersRouter.get("/deleteAccounts", async(req,res)=>{
    if(req.session.user.admin){
        const twoDays = new Date();
        twoDays.setDate(twoDays.getDate() - 2);
        try{
            const result = await usersModel.deleteMany({last_connection: {$lt: twoDays} });
            req.flash("success",`A total of ${result.deletedCount} accounts have been removed`)
            res.status(200).redirect("/api/products");
        }catch(error){
            req.flash("error",`Internal Server Error, Error deleting accounts`);
            res.status(500).redirect("/api/products");
        }
    }else{
        req.flash("error", "You don't have access to this section");
        res.status(401).redirect("/api/products");
    }
});

module.exports = usersRouter;