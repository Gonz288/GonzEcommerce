const {faker} = require("@faker-js/faker");

faker.locale = "es";

const generateProducts = () =>{
    return{
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.random.alphaNumeric(6),
        price: faker.commerce.price(),
        thumbnail: faker.image.image(),
        stock: faker.random.numeric(1),
        category: faker.commerce.department(),
        status: true,
        id: faker.database.mongodbObjectId(),
    }
};

module.exports = generateProducts;