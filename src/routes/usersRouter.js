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
        res.status(203).send("No tienes Acceso");
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
        res.status(203).send("No tienes Acceso");
    }
});

usersRouter.post("/profile", uploadProfile, async (req,res)=>{
    if(req.session.user){
        try{
            const {firstname,lastname} = req.body;
            let img;
            if(req.file){
                img = `/img/profiles/${req.file.filename}`;
            }
            const dbUser = await usersModel.findByIdAndUpdate(
                { _id: req.session.user._id },
                { firstname, lastname, img}, 
                { new:true } //Devuelve el usuario actualizado
            );
            req.session.user.firstname = firstname;
            req.session.user.lastname = lastname;
            res.render("profile", {dbUser})
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso.");
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
                { new:true } //Devuelve el usuario actualizado
            );
            
            res.status(200).redirect("/api/users/profile");
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso.");
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
            fs.unlink(`./src/public/${urlDelete}`, (err) => {
                if (err) {
                    console.error('Error al eliminar el documento:', err);
                    res.status(500).redirect("/api/users/profile");
                    return;
                } else {
                    console.log('Documento eliminado correctamente');
                }
            });
            const dbUser = await usersModel.findByIdAndUpdate(
                { _id: req.session.user._id },
                { documents: newDocuments }, 
                { new:true } //Devuelve el usuario actualizado
            );
            res.status(200).redirect("/api/users/profile");
        }catch(error){
            res.status(500).redirect("/api/users/profile");
        }
    }else{
        res.status(401).send("No tienes Acceso.");
    }
});

usersRouter.get("/profile", async (req,res)=>{
    if(req.session.user){
        try{
            const dbUser = await usersModel.findById(req.session.user._id);
            res.status(201).render("profile",{dbUser});
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso.");
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
                res.send("Se ha cambiado el estado del premium del usuario");
            }else{
                if(user.documents.length >= 3){
                    user.premium = premium;
                    const saveUser = await usersModel.findByIdAndUpdate(uid, user);
                    res.send("Se ha cambiado el estado del premium del usuario");
                }else{
                    res.send("Error, el usuario todavia no ha subido toda la documentacion.");
                }
            }
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso a esta seccion.");
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
            res.send("Se ha cambiado el estado del admin del usuario");
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso a esta seccion.");
    }
});

usersRouter.get("/logout", async(req,res) =>{
    const saveDate = await usersModel.findOneAndUpdate(req.session.user._id, {last_connection: new Date()});
    req.session.destroy();
    res.status(200).redirect("/login");
});

module.exports = usersRouter;