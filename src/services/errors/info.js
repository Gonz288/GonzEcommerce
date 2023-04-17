const generateUserErrorInfo = (user)=>{
    return `Una o mas propiedades estan incompletas o no son validas.
    Lista de propiedades requeridas:
    * first_name : necesita ser un String, recibio ${user.first_name}
    * last_name  : necesita ser un String, recibio ${user.last_name}
    * email      : necesita ser un String, recibio ${user.email}
    * age        : necesita ser un String, recibio ${user.age}`
}

module.exports = generateUserErrorInfo;