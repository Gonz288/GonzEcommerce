const express = require("express");
const usersModel = require("../dao/mongo/models/usersModel");
const ResetPassword = require("../dao/mongo/models/resetPassword");
const nodemailer = require("nodemailer");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const {logger} = require("../config/utils");

const transport = nodemailer.createTransport({
    service:'gmail',
    port: 587,
    auth:{
        user:'gonzagonzalez288@gmail.com',
        pass:'icunvygjuhenqqpd'
    }
});

//Render FrontEnd RecoverPassword
router.get("/sendEmail", (req,res)=>{
    res.render("sendEmail", {});
});

//Send Email RecoverPassword
router.post("/sendEmail", async (req,res)=>{
    const { email } = req.body;
    try {
        const user = await usersModel.findOne({ email: email });
        if (!user) {
            req.flash("error", "User doesn't exist");
            return res.status(404).redirect("/recoverPassword/sendEmail");
        }
        const token = crypto.randomBytes(20).toString("hex");
        const resetPassword = new ResetPassword({
            email: email,
            token: token,
            status: true,
        });
        const [resultToken, resultEmail] = await Promise.all([
            resetPassword.save(),
            transport.sendMail({
                from: '"GonzE-Commerce" <gonzagonzalez288@gmail.com>',
                to: email,
                subject: "Recover Password, GonzE-Commerce",
                html: `
                <div>
                    <h1>Link to recover your password, this link expires in 1 hour.</h1>
                    <h5><a href='localhost:8080/recoverPassword/${token}'>http://localhost:8080/recoverPassword/${token}</a></h5>
                    <h4>This link expires in 1 hour.</h4>
                </div>
                `,
                attachments: [],
            }),
        ]);

        if (resultToken && resultEmail) {
            req.flash("success", `An email with a password reset link has been sent to your email: ${email}`);
            res.status(200).redirect("/recoverPassword/sendEmail");
        } else {
            req.flash("error", "Unexpected Error");
            res.status(500).redirect("/recoverPassword/sendEmail");
        }
    } catch (error) {
        logger.error(`Internal Server Error: ${error}`);
        req.flash("error", "Internal Server Error");
        res.status(500).redirect("/recoverPassword/sendEmail");
    }
});

//Render ChangePassword
router.get("/:key", async(req,res) =>{
    const { key } = req.params;
    const tokenExists = await ResetPassword.findOne({token: key});
    if(tokenExists){
        res.render("resetPassword", {key});
    }else{
        req.flash("error","This link already expired");
        res.status(400).redirect("/recoverPassword/sendEmail");
    }
});

//Change Password
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
                    req.flash("success", "Password changed successfully");
                    res.status(200).redirect("/login");
                }catch(error){
                    req.flash("error", "Internal Server Error, Password not changed");
                    res.status(500).redirect(`/recoverPassword/${key}`);
                }
            }else{
                req.flash("error", "This password has already been used");
                res.status(400).redirect(`/recoverPassword/${key}`);
            }
        }else{
            req.flash("error", "Passwords don't match");
            res.status(400).redirect(`/recoverPassword/${key}`);
        }
    }else{
        req.flash("error","This link already expired");
        res.status(400).redirect(`/login`);
    }

});

module.exports = router;