const socket = io();

//Chat y Mensajes
let url = window.location;
if(`http://${url.host}/chat` === url.href){
    let chatBox = document.getElementById("chatBox");
    let user;
    Swal.fire({
        title: "Inicie Sesion",
        text: "Ingrese su nombre de usuario",
        input: "text",
        confirmButtonText : "Ingresar",
        allowOutsideClick: false,
        inputValidator: (value) =>{
            if(!value){
                return "Error, Debe ingresar un nombre de usuario!";
            }
        },
    }).then((result) =>{
        if(result.value){
            user = result.value;
            socket.emit("newUser", {user: user, id: socket.id});
        }
    });

    chatBox.addEventListener("keyup", (event) =>{
        if(event.key === "Enter"){
            if(chatBox.value.trim().length > 0){
                socket.emit("message", {
                    user: user,
                    message: chatBox.value,
                });
                chatBox.value = "";
            }
        }
    });

    socket.on("messageLogs", (data) =>{
        let log = document.getElementById("messageLogs");
        let message = "";

        data.forEach((elem) =>{
            message += `
            <div class="chat-message">
                <div class="message-bubble">
                    <div class="message-sender">${elem.user}</div>
                        <p>${elem.message}</p>
                    </div>
                </div>
            `;
        });
        log.innerHTML = message;
    });

    socket.on("newUserConnected", (data) =>{
        if(data.id !== socket.id){
            Swal.fire({
                text:`${data.user} se ha conectado al chat`,
                toast: true,
                position: "top-end",
            });
        }
    });

    socket.on("usersLogs", (data) =>{
        let list = document.getElementById("usersList");
        let username = "";
        data.forEach((elem) =>{
            username += `
                <div class="user">
                    <div class="cartelConectado">Conectado</div>
                    <p> <b>Usuario:</b> ${elem.user} </p>
                </div>
            `;
        });
        list.innerHTML = username;
    });

    socket.on("userDisconnected", (data) =>{
        if(data.id !== socket.id){
            Swal.fire({
                text:`${data.user} se ha desconectado del chat`,
                toast: true,
                position: "top-end",
            });
        }
    });

    function firstLoad() {
        let log = document.getElementById("messageLogs");
        fetch("/messages")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            let message = "";
            data.forEach((elem) => {
                message += `
                    <div class="chat-message">
                        <div class="message-bubble">
                            <div class="message-sender">${elem.user}</div>
                            <p>${elem.message}</p>
                        </div>
                    </div>
                `;
            });
        log.innerHTML = message;
        });
    }
    firstLoad();
}