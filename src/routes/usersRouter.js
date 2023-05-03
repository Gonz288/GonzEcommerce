const express = require("express");
const usersModel = require("../dao/mongo/models/usersModel");
const usersRouter = express.Router();

usersRouter.get("/premium/:uid", async(req,res) =>{
    if(req.session.user.admin){
        const { uid } = req.params;
        try{
            const user = await usersModel.findById(uid);
            user.premium ? user.premium = false : user.premium = true;
            const saveUser = await usersModel.findByIdAndUpdate(uid, user);
            res.send("Se ha cambiado el estado del premium del usuario");
        }catch(error){
            throw error;
        }
    }else{
        res.status(401).send("No tienes Acceso a esta seccion.");
    }
});

module.exports = usersRouter;