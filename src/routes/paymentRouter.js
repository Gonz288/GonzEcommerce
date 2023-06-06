const express = require("express");
const paymentRouter = express.Router();
const config = require("../config/config");

const {Carts} = require("../dao/factory");
const {CartsRepository} = require("../repositories/carts.repository");
const cartsService = new CartsRepository(new Carts());

const stripe = require('stripe')(config.STRIPE_KEY);
//Falta poner los productos del carrito en line_items y que funcione con ticketRouter

paymentRouter.get('/create-checkout-session/:cid', async (req, res) => {
    const {cid} = req.params;
    const cart = await cartsService.getOne(cid);

    if(cart.products.length === 0){
        res.send("Your cart is empty!");
        return;
    }else{
        let line_items = [];
        for(let product of cart.products){
            line_items.push(
                {
                    price_data:{
                        currency: 'usd',
                        product_data:{
                            name: product.product.description
                        },
                        unit_amount: (Math.round(product.product.price / 480)) * 100,
                    },
                    quantity: product.quantity,
                }
            );
        }
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `http://localhost:8080/api/carts/${cid}/purchase`,
            cancel_url: `http://localhost:8080/api/carts/${cid}`,
        });
        res.redirect(303, session.url);
    }
});

module.exports = paymentRouter;
