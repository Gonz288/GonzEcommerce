const Router = require("express");
const Crypto = require("crypto");
const ticketModel = require("../dao/mongo/models/ticketModel");

const ticketRouter = Router();

ticketRouter.post("/", async(req,res) =>{
    const myTicket = {
        code: Crypto.randomBytes(16).toString("hex").substring(0, 6),
        purchase_datetime: req.body.purchase_datetime,
        amount: req.body.amount,
        purchaser: req.body.purchaser,
        created_at: new Date(),
        updated_at: new Date(),
    }
    try{
        const ticket = await ticketModel.create(myTicket);
        res.status(201).json(ticket);
    }catch(error){
        res.status(500).json({error: error.message});
    }
});
ticketRouter.put("/", async(req,res) =>{
    const myTicket = {
        purchase_datetime: req.body.purchase_datetime,
        amount: req.body.amount,
        purchaser: req.body.purchaser,
        updated_at: new Date(),
    }
    try{
        const ticket = await ticketModel.findByIdAndUpdate(myTicket);
        res.status(201).json(ticket);
    }catch(error){
        res.status(500).json({error: error.message});
    }
});

module.exports = ticketRouter;