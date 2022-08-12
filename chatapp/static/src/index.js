// all setups for connecting to websocket to start text chats, and webRTC to start video chats, are done here.
let protocolScheme= window.location.origin.split(':')[0] === 'http' ? 'ws' : 'wss' //checks the scheme(or context of the current protocol whether secure or not, to know what our websocket would use.)
let websocketUrl= `${protocolScheme}://${window.location.host}/chat`

// major functions to handle other things below.
const chatImplementations= (roomName, chatMsg, sendBtn, textToSend)=>{
    let socket = new WebSocket(`${websocketUrl}/${roomName}/`)//websocket gets instantiated here.
    let rtcPeer= new RTCPeerConnection()// webRTC gets instantiated here it needs to be provisioned a stun server configuration, which I'll implement soon.
    
    // Handling of events starts below for both websocket and webRTC
    socket.onmessage= (e)=>{
        let data = JSON.parse(e.data)
        let userFromBackend= data.user
        chatMsg.textContent = data.message
    }

    sendBtn.onclick= (event)=>{
        //to know when the user is going to be sending a message to the websocket handler at the backend.
        let messageToSend= textToSend.value
        if (messageToSend && (messageToSend !== '' || messageToSend !== '0')){ //this checks whether a user intends to send a message, and not just a mistake of pressing the send button.
            socket.send( JSON.stringify(messageToSend)) //sends the data to the websocket handler on the backend.
        }
    }
    socket.onclose= (e)=>{
        //handles a close even: tells others informs that something has happended at the backend.
        chatMsg.textContent= 'Connection closed unexpectedly.'
    }
}
// needed html elements go below
let roomName= document.querySelector('#room-name').textContent.trim()
let chatMsg= document.querySelector('.chat-msg')
let clickBtn= document.querySelector('#click-btn')
let userInput= document.querySelector('#user-input')

chatImplementations(roomName, chatMsg, clickBtn, userInput) //calling my functions with the appropriate elements