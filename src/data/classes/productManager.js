const fsPromises = require('fs/promises');
const { Module } = require('module');

class ProductManager{
    constructor(filepath){
        this.filepath = filepath;
    }

    async readfile(){
        try{
            const file = await fsPromises.readFile(this.filepath, "utf-8");
            const fileParse = JSON.parse(file);
            return fileParse;
        }catch(error){
            console.log("Error, no se pudo leer el archivo.");
        }
    }

    async writeFile(array){
        try{
            await fsPromises.writeFile(this.filepath,JSON.stringify(array,null,4));
        }catch(error){
            console.log("Error, no se pudo escribir en el archivo.");
        }
    }

    async findObjectById(idFind){
        const products = await this.readfile();
        let objectFind = products.find((objeto)=> objeto.id === idFind);
        return objectFind;
    }

    async addProduct(newProduct){
        const products = await this.readfile();
        try{
            if(products.length !== 0){//Si hay objetos
                let verifyCode = products.find((object)=> object.code === newProduct.code);
                if(!verifyCode){
                    let ultimoId = products[products.length - 1].id;
                    newProduct.id = ultimoId + 1;
                    let arrayProducts = products;
                    arrayProducts.push(newProduct);
                    await this.writeFile(arrayProducts);
                    return {
                        response: true,
                        text: "Producto agregado correctamente!"
                    };
                }else{
                    return {
                            response: false,
                            text: "Ya existe un producto con ese codigo!"
                        };
                }
            }else{ //Si no hay objetos en el JSON
                await this.writeFile([{...newProduct, id: 0}]);
                return {
                    response: true,
                    text: "Producto agregado correctamente!"
                };
            }
        }catch(error){
            return "Error, no se pudo agregar el producto.";
        }
    }

    async getProducts(){
        const products = await this.readfile();
        try{
            if(products.length === 0){
                return "No hay Productos en la BD";
            }else{
                return products;
            }
        }catch(error){
            console.log("Error, no se pudieron encontrar los productos.");
        }
    }

    async getProductsById(idFind){
        const products = await this.readfile();
        try{
            let objectFind = products.find((objeto)=> objeto.id === idFind);
            if(objectFind){
                return objectFind;
            }else{
                return "El producto con ese ID no existe!";
            }
        }catch(error){
            console.log("Error, no se pudo buscar el producto")
        }
    }

    async updateProduct(idUpdate, newObject){
        const products = await this.readfile();
        try{
            let verifyCode = products.find((object)=> object.code === newObject.code);
            let verifyId = products.find((object)=> object.id === idUpdate);
            if(verifyId){
                if(!verifyCode){
                    for(const object of products){
                        if(object.id == idUpdate){
                            object.title = newObject.title;
                            object.description = newObject.description;
                            object.price = newObject.price;
                            object.status = newObject.status;
                            object.code = newObject.code;
                            object.category = newObject.category;
                            object.stock = newObject.stock;
                            object.id = idUpdate;
                        }   
                    }    
                    await this.writeFile(products);
                    return "Producto actualizado correctamente";
                }else{
                    return "Error al actualizar, Ya existe un producto con ese codigo.";
                }
            }else{
                return "Error, no existe ese producto con ese id";
            }
        }catch(error){
            return "Error, No se pudo actualizar el producto";
        }
    }

    async deleteProduct(idDelete){
        const products = await this.readfile();
        try{
            let objectDelete = await this.findObjectById(idDelete);
            if(objectDelete){
                const filterArray = products.filter((object) => object.id !== objectDelete.id);
                await this.writeFile(filterArray);
                return {
                    response: true,
                    text: "Producto eliminado correctamente!"
                }
            }else{  
                return {
                    response: false,
                    text: "Error, No se pudo encontrar el producto a eliminar"
                }
            }
        }catch(error){
            return "Error, No se pudo buscar el producto a eliminar";
        }
    }
}

const classManager = new ProductManager('./database/productos.json');

module.exports = {
    ProductManager: classManager
}