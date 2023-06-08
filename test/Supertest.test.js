const chai = require('chai');
const supertest = require('supertest');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe("API Test", async () => {
    let cookie;
    let productId;

    describe("Sessions Test", async () => {
        it("Should successfully register a user", async function () {
            const mockUser = {
                firstname: "Test",
                lastname: "UserTest",
                age: 30,
                email: "emailTest@gmail.com",
                password: "123",
                confirm_password: "123",
                admin: true
            };
            const { statusCode, ok, _body } = await requester.post("/signup").send(mockUser);
        });

        it("Should successfully log in the user and return a cookie", async function () {
            const mockUser = {
                email: "emailTest@gmail.com",
                password: "123"
            };
            const result = await requester.post('/login').send(mockUser);
            const cookieResult = result.headers['set-cookie'][0];
            expect(cookieResult).to.be.ok;
            cookie = {
            name: cookieResult.split('=')[0],
            value: cookieResult.split("=")[1]
            };
            expect(cookie.name).to.be.ok.and.eql('coderCookie');
            expect(cookie.value).to.be.ok;
        });

        it("Should send the cookie containing the user and correctly destructure it", async function () {
            const { _body } = await requester.get("/api/sessions/current").set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body.user.email).to.be.eql("emailTest@gmail.com");
        });
        });

    describe("Products Test", async () => {
        it("The GET /api/products endpoint should retrieve all products by navigating through the products", async () => {
            const {
            statusCode,
            ok,
            _body
            } = await requester.get("/api/products");
        });

        it("The POST /api/products endpoint should create a product in the database", async () => {
            const productMock = {
            title: "Motherboard",
            description: "ASUS Motherboard A2S3",
            code: "123abc",
            price: 3000,
            thumbnail: "/img/motherboards/test.png",
            stock: 200,
            category: "motherboards",
            status: true,
            };
            const {
            statusCode,
            ok,
            _body
            } = await requester.post("/api/products").set('Cookie', [`${cookie.name}=${cookie.value}`]).send(productMock);
            productId = _body._id;
        });

        it("The PUT /api/products/put/:id endpoint should update a product in the database based on the ID", async () => {
            const newProduct = {
            title: "MotherboardTest",
            description: "ASUS Motherboard A2S3",
            code: "123abcdbeasg",
            price: 35460,
            thumbnail: "/img/motherboards/test.png",
            stock: 350,
            category: "motherboards",
            status: true,
            };
            const {
            statusCode,
            ok,
            _body
            } = await requester.post("/api/products").set('Cookie', [`${cookie.name}=${cookie.value}`]).send(newProduct);
        });

        it("The DELETE /api/products/delete/:id endpoint should delete a product from the database based on the ID", async () => {
            const { statusCode, ok, _body } = await requester.delete(`/api/products/delete/${productId}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
        });
        });

    describe("Carts Test", async () => {
        let cid;

        it("The GET /api/carts endpoint should retrieve all carts", async function () {
            const { statusCode, ok, _body } = await requester.get("/api/carts");
        });

        it("The POST /api/carts endpoint should create a cart", async function () {
            const { statusCode, ok, _body } = await requester.post(`/api/carts`);
            cid = _body.response._id;
        });

        it("The GET /api/carts/:cid endpoint should retrieve a cart by ID", async function () {
            const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`);
        });

        it("The POST /api/carts/:cid endpoint should add a product to the cart", async function () {
            const product = {
            _id: productId,
            quantity: 5
            };
            const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}`).send(product);
        });

        it("The DELETE /api/carts/:cid endpoint should delete all products from a specific cart", async function () {
            const { statusCode, ok, _body } = await requester.delete(`/api/carts/${cid}`);
        });

        it("The DELETE /api/carts/:cid/products/:pid endpoint should delete a specific product from a cart", async function () {
            const { statusCode, ok, _body } = await requester.delete(`/api/carts/${cid}/products/${productId}`);
        });
    
        it("The GET /api/carts/:cid/purchase endpoint should finalize the purchase of a cart", async function () {
            const { statusCode, ok, _body } = await requester.get(`/api/carts/${cid}/purchase`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
        });
    });
});