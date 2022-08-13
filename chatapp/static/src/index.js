// all setups for connecting to websocket to start text chats, and webRTC to start video chats, are done here.
let protocolScheme= window.location.origin.split(':')[0] === 'http' ? 'ws' : 'wss' //checks the scheme(or context of the current protocol whether secure or not, to know what our websocket would use.)
let websocketUrl= `${protocolScheme}://${window.location.host}/chat`

// major functions to handle other things below.
const chatImplementations= async (roomName, chatMsg, sendBtn, textToSend)=>{
    let socket = new WebSocket(`${websocketUrl}/${roomName}/`)//websocket gets instantiated here.
    let rtcPeer= new RTCPeerConnection()// webRTC gets instantiated here it needs to be provisioned a stun server configuration, which I'll implement soon.
    
    // buttons to start/end video are selected for events on when a user intends to start video
    let startVidBtn= document.querySelector('#start-vid')
    let endVidBtn = document.querySelector('#end-vid')
    let joinVidBtn= document.querySelector('#join-vid')
    let localVid= document.querySelector('#user-vid')
    let vidElementsContainer= document.querySelector('.video-cont')// this container should append all video elements of connecting users
    // adding event listeners to all button below, for their respective actions
    startVidBtn.addEventListener('click', async (e)=>{
        /**
         * Starts user video, and then create an offer to be sent to other users through
         * websocket, for peer to peer streaming of videos media
         * webRTC has asynchronous interface(returns Promises objects), therefore, I need to use async await
         */ 
        let mediaStream= await navigator.mediaDevices.getUserMedia({video:true, audio:true})//gets video and audio media data of the user starting a live session
        localVid.srcObject= mediaStream//passes streams to local video element
        mediaStream.getTracks().forEach((track)=> rtcPeer.addTrack(track, mediaStream))/** this is to add all the media data(audio and video) we get from a local user, into the current RTC session
        This is efficient because, immediately our offer is accepted and the each peer has the nominated "ICE candidate(i.e, our IP:PORT_NUMBER in the public)", each peer can immediately start receiving
        each other's media stream*/
        localVid.style.display= 'flex'
        let localOffer= rtcPeer.createOffer()// creates an offer here to be sent to anyone whoe wants to join the current video session
        rtcPeer.setLocalDescription(localOffer)// sets my offer as my local description
        
        socket.send(JSON.stringify({ //send this offer to web socket backend for any who'd like to join the session
            offer: localOffer
        }))
    })


    // Handling of events starts below for both websocket and webRTC
    socket.onmessage= (e)=>{
        let data = JSON.parse(e.data)
        let userFromBackend= data.user //this gets the currently authenticated user, as passed down from message sent from backend.
        
        /** check for the whether message was either an offer by the host, or an answer by a peer, or random text for message
         * to know what to do with the message.
        */
       if (data.offer){
        //so if we receive an offer from the video chat starter, we want to respond to it by creating an answer, and setting the respective SDPs(Session Descriptions--> which are still same as our offers and answers, though)
        let localAnswer= rtcPeer.createAnswer()// creates an asnwer.
        let remoteOffer= new RTCSessionDescription(data.offer)//creates an object of SDP so I can set it as a remote SD
        rtcPeer.setRemoteDescription(remoteOffer)
        //now set my answer as my local description 
        rtcPeer.setLocalDescription(localAnswer)
        //now get my local media streams, and add them to the local video element and to RTC session immediately
        let mediaStreamForAnswer= await navigator.mediaDevices.getUserMedia({video:true, audio:true})
        localVid.srcObject= mediaStreamForAnswer
        mediaStreamForAnswer.getTracks().forEach((track)=> rtcPeer.addTrack(track, mediaStreamForAnswer))
        //then send my answer to the host of the video (the offer creator), through my signaling server (websocket)
        socket.send(JSON.stringify(localAnswer))
       }

       else if (data.answer){
        /**so if I as a local user, have created an offer, and then I awaited an answer from any peer listening to the offer on the signaling server(websocke),
         * I just have to perform the ssame process as above for their answers.
        */
        let remoteAnser= new RTCSessionDescription(data.answer)
        //now add their answer as a remote SDP
        rtcPeer.setRemoteDescription(remoteAnser)
        /**
         * that's all I have to do. There's no need of creating and setting local description anymore, since I did that earlier
         * when I was creating an offer.
         * */ 
       }

       else{
        /**
         * now this is to handle other messages that come from any peer, through our signaling server (websocket.)
         * Majorly, this is going to be a regular chat message, so I just have to display this in the chat box.
         */
        chatMsg.textContent= data.message 
       }
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

    /** other events related to rtc objects go below (events for things like getting the ice-candidate(public socket) when it's ready);
     * listening for when our the remote user started adding its own media tracks to the session
    */

    rtcPeer.addEventListener('track', (e)=>{
        /** Listen for the remote tracks coming into the session; 
         * then create remote user video, to start receiving media streams from the remote user.
        */
        let remoteVid= document.createElement('VIDEO')
        remoteVid.id= 'remote-vid'
        remoteVid.autoplay= true
        vidElementsContainer.appendChild(remoteVid)
        //now get the remote streams from the event, and add them to this video element
        let remoteStreams = e.streams
        remoteVid.srcObject= remoteStreams
        //now add the tracks to this video element just created.
    })
}
// needed html elements go below for websocket chat here
let roomName= document.querySelector('#room-name').textContent.trim()// the room name we got from the url, and passed down to our templates through context processor
let chatMsg= document.querySelector('.chat-msg')// the box that shows all the messages we send to the users
let clickBtn= document.querySelector('#click-btn')// the button to send our websocket message
let userInput= document.querySelector('#user-input')//the widget to type in your messages.

chatImplementations(roomName, chatMsg, clickBtn, userInput) //calling my functions with the appropriate elements