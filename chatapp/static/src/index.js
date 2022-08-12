// all setups for connecting to websocket to start text chats, and webRTC to start video chats, are done here.
let protocolSheme= window.location.origin.split(':')[0] === 'http' ? 'ws' : 'wss' //checks the scheme(or context of the current protocol whether secure or not, to know what our websocket would use.)
let websocketUrl= `${protocolSheme}://${window.location.host}/chat`

// major functions to handle other things below.
const chatImplementations= ()=>{
    let roomName= document.querySelector('#room-name').textContent
    let chatMsg= document.querySelector('.chat-msg')
    let clickBtn= document.querySelector('#click-btn')
    let userInput= document.querySelector('#user-input')
    let socket = new WebSocket(`${websocketUrl}/roomName/`)//websocket gets instantiated here.

    socket.onmessage= (e)=>{// this checks if a message has come in, and then displays the message in the container provided as 'chatMsg'
        let data = JSON.parse(e.data)
        let userFromBackend= data.user
        chatMsg.textContent = data.message
    }

    clickBtn.onclick= (event)=>{
        //to know when the user is going to be sending a message to the websocket handler at the backend.
        let messageToSend= userInput.value
        if (messageToSend && (messageToSend !== '' || messageToSend !== '0')){ //this checks whether a user intends to send a message, and not just a mistake of pressing the send button.
            socket.send( JSON.stringify(messageToSend)) //sends the data to the websocket handler on the backend.
        }
    }
}