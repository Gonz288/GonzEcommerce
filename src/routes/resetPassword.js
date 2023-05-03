const express = require("express");
const usersModel = require("../dao/mongo/models/usersModel");
const ResetPassword = require("../dao/mongo/models/resetPassword");
const nodemailer = require("nodemailer");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const transport = nodemailer.createTransport({
    service:'gmail',
    port: 587,
    auth:{
        user:'gonzagonzalez288@gmail.com',
        pass:'icunvygjuhenqqpd'
    }
});


//Enviar email de Reseteo de password
router.get("/sendEmail", (req,res)=>{
    res.render("sendEmail", {});
});

router.post("/sendEmail", async (req,res)=>{
    const { email } = req.body;
    try{
        const user = await usersModel.findOne({email:email});
        if(!user){
            res.render("sendEmail",{error: "User doesn't exists"})
        }else{
            const token = crypto.randomBytes(20).toString("hex");
            const resetPassword = new ResetPassword({
                email: email,
                token: token,
                status: true,
            });
            const resultToken = await resetPassword.save();

            let resultEmail = await transport.sendMail({
                from:'"E-Commerce" <gonzagonzalez288@gmail.com>',
                to: email,
                subject: "Recover Password",
                html: `
                <div>
                    <h1>Link to recover your password, this link expired in 1 hour.</h1>
                    <a href='localhost:8080/recoverPassword/${token}'>Click in this link to reset your password.</a>
                    <h4>This link expired in 1 hour.</h4>
                </div>
                `,
                attachments: []
            });

            if(resultToken && resultEmail){
                res.send(`An email with a password reset link has been sent to your email: ${email}`)
            }else{
                res.send("Unexpected Error");
            }
        }
    }catch(error){
        throw error;
    }
});


//Cambiar Contraseña
router.get("/:key", async(req,res) =>{
    const { key } = req.params;
    const tokenExists = await ResetPassword.findOne({token: key});
    if(tokenExists){
        res.render("resetPassword", {key});
    }else{
        res.redirect("/recoverPassword/sendEmail");
    }
});

router.post("/:key", async(req,res)=>{
    const { key } = req.params;
    const { password, confirmPassword } = req.body;
    
    const tokenExists = await ResetPassword.findOne({token: key});
    if(tokenExists){
        const getUser = await usersModel.findOne({email: tokenExists.email});
        if(password === confirmPassword){
            if(!bcrypt.compareSync(password,getUser.password)){
                try{
                    const savePassword = await usersModel.findByIdAndUpdate(getUser.id, {password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))});
                    res.send(`La contraseña ha sido cambiada exitosamente.`);
                }catch(error){
                    res.send("Error, no se pudo cambiar la contraseña");
                }
            }else{
                res.send("Error, no se puede cambiar por la misma contraseña.")
            }
        }else{
            res.send("Error, las contraseñas no son iguales");
        }
    }else{
        res.send("Error, the token doesn't exist");
    }

});

module.exports = router;