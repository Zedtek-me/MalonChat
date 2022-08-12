// all setups for connecting to websocket to start text chats, and webRTC to start video chats, are done here.
let protocolScheme= window.location.origin.split(':')[0] === 'http' ? 'ws' : 'wss' //checks the scheme(or context of the current protocol whether secure or not, to know what our websocket would use.)
let websocketUrl= `${protocolScheme}://${window.location.host}/chat`

// major functions to handle other things below.
const chatImplementations= (roomName, chatMsg, sendBtn, textToSend)=>{
    let socket = new WebSocket(`${websocketUrl}/${roomName}/`)//websocket gets instantiated here.
    let rtcPeer= new RTCPeerConnection()// webRTC gets instantiated here it needs to be provisioned a stun server configuration, which I'll implement soon.
    
    // buttons to start/end video are selected for events on when a user intends to start video
    let startVidBtn= document.querySelector('#start-vid')
    let endVidBtn = document.querySelector('#end-vid')
    let joinVidBtn= document.querySelector('#join-vid')
    let localVid= document.querySelector('user-vid')

    startVidBtn.addEventListener('click', async (e)=>{
        /**
         * Starts user video, and then create an offer to be sent to other users through
         * websocket, for peer to peer streaming of videos media
         * webRTC has asynchronous interface(returns Promises objects), therefore, I need to use async await
         */ 
        let mediaStream= await navigator.mediaDevices.getUserMedia({video:true, audio:true})//gets video and audio data for the user
        localVid.srcObject= mediaStream//passes streams to local video element
        let localOffer= rtcPeer.createOffer()// creates an offer here to be sent to anyone whoe wants to join the current video session
        rtcPeer.setLocalDescription(localOffer)// sets my offer as my local description
        
        socket.send(JSON.stringify({ //send this offer to web socket backend for any who'd like to join the session
            offer: localOffer
        }))
    })
    // Handling of events starts below for both websocket and webRTC
    socket.onmessage= (e)=>{
        let data = JSON.parse(e.data)
        let userFromBackend= data.user
        
        /** check for the whether message was either an offer by the host, or an answer by a peer, or random text for message
         * to know what to do with the message
         * 
        */
    }

    sendBtn.onclick= (event)=>{
        //to know when the user is going to be sending a message to the websocket handler at the backend.
        let messageToSend= textToSend.value
        textToSend.value= ''
        if (messageToSend && (messageToSend !== '' || messageToSend !== '0')){ //this checks whether a user intends to send a message, and not just a mistake of pressing the send button.
            socket.send( JSON.stringify(messageToSend)) //sends the data to the websocket handler on the backend.
        }
    }
    socket.onclose= (e)=>{
        //handles a close even: tells others informs that something has happended at the backend.
        chatMsg.textContent= 'Connection closed unexpectedly.'
    }
}
// needed html elements go below for websocket chat here
let roomName= document.querySelector('#room-name').textContent.trim()
let chatMsg= document.querySelector('.chat-msg')
let clickBtn= document.querySelector('#click-btn')
let userInput= document.querySelector('#user-input')

chatImplementations(roomName, chatMsg, clickBtn, userInput) //calling my functions with the appropriate elements