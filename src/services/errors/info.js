const generateUserErrorInfo = (user)=>{
    return `Una o mas propiedades estan incompletas o no son validas.
    Lista de propiedades requeridas:
    * first_name : necesita ser un String, recibio ${user.firstname}
    * last_name  : necesita ser un String, recibio ${user.lastname}
    * email      : necesita ser un String, recibio ${user.email}
    * age        : necesita ser un String, recibio ${user.age}`
}

module.exports = generateUserErrorInfo;