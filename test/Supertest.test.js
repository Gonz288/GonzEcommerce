const chai = require('chai');
const supertest = require('supertest');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe("Test de mi Api", async()=>{
    let cookie;
    let productId;
    describe("Test de Sessions", async()=>{
        it("Debe registrar correctamente a un usuario", async function(){
            const mockUser = {
                firstname: "Test",
                lastname: "UserTest",
                age: 30,
                email: "emailTest@gmail.com",
                password: "123",
                confirm_password: "123",
                admin: true
            }
            const { statusCode, ok , _body } = await requester.post("/signup").send(mockUser);
        });
        it("Debe loguear correctamente al usuario y devolver una cookie", async function(){
            const mockUser ={
                email: "emailTest@gmail.com",
                password: "123"
            }
            const result = await requester.post('/login').send(mockUser);
            const cookieResult = result.headers['set-cookie'][0]
            expect(cookieResult).to.be.ok;
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split("=")[1]
            }
            expect(cookie.name).to.be.ok.and.eql('coderCookie');
            expect(cookie.value).to.be.ok;
        });
        it("Debe enviar la cookie que contiene el usuario y destructurar este correctamente", async function(){
            const { _body } = await requester.get("/api/sessions/current").set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body.user.email).to.be.eql("emailTest@gmail.com");
        });
    });
    describe("Test de productos", async()=>{
        it("El endpoint GET /api/products debe traer todos los productos haciendo un navigate de los productos", async()=>{
            const{
                statusCode,
                ok,
                _body
            } = await requester.get("/api/products");
        });
        it("El endpoint POST /api/products debe crear un producto en la base de datos", async()=>{
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
        it("El endpoint PUT /api/products/put/:id debe actualizar un producto de la base de datos a partir del id", async()=>{
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
        it("El endpoint DELETE /api/products/delete/:id debe eliminar un producto de la base de datos a partir del id", async()=>{
            const {statusCode, ok,_body} = await requester.delete(`/api/products/delete/${productId}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
        });
    });
    describe("Test de Carritos", async()=>{
        let cid;
        it("El endpoint GET /api/carts debe traer todos los carritos", async function(){
            const {statusCode, ok,_body} = await requester.get("/api/carts");
        });
        it("El endpoint POST /api/carts  debe crear un carrito", async function(){
            const {statusCode, ok, _body} = await requester.post(`/api/carts`);
            cid = _body.response._id
        });
        it("El endpoint GET /api/carts/:cid debe traer un carrito por Id", async function(){
            const {statusCode, ok, _body} = await requester.get(`/api/carts/${cid}`);
        });
        it("El endpoint POST /api/carts/:cid debe agregar un producto al carrito", async function(){
            const product = {
                _id: productId,
                quantity: 5
            }
            const {statusCode, ok, _body} = await requester.get(`/api/carts/${cid}`).send(product);
        });
        it("El endpoint DELETE /api/carts/:cid debe eliminar todos los productos de un carrito especifico", async function(){
            const {statusCode, ok, _body} = await requester.delete(`/api/carts/${cid}`)
        });
        it("El endpoint DELETE /api/carts/:cid/products/:pid debe eliminar solamente un producto en especifico de un carrito", async function(){
            const {statusCode, ok,_body} = await requester.delete(`/api/carts/${cid}/products/${productId}`);
        });
        it("El endpoint GET /api/carts/:cid/purchase debe finalizar la compra de un carrito", async function(){
            const {statusCode, ok,_body} = await requester.get(`/api/carts/${cid}/purchase`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
        });
    });
});