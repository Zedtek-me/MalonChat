# here's where the major handling of chats among peers happen...

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class UserChats(AsyncWebsocketConsumer):
    '''
    This class inherits method(like 'accept', 'send', 'disconnect', etc.)from the asyncwebsocket consumer
    It handles the acceptance of the websocket connection from the frontend, and distribute messages as appropriate.
    It's an asynchronous way of handling the connection, although, I could use the synchronouse too.
    '''
    incoming_users= [] # I deliberately set this, because I might need a reference to all users connected later. So, I append the username of all incoming users to this List (or Array)
    async def connect(self):
        self.user= self.scope.get('user').username#gets the current user, available in the current TCP scope(the AuthMiddleWareStack makes this possible.)
        self.incoming_users.append(self.user)
        self.room= self.scope['url_route']['kwargs'].get('room_name')#checks if the user specifies a room to enter
        if(self.room):
            '''
            adds user to a room if a room is specified to be entered.
            A custom distributed system known as channels layers, is provided for django
            channels. This distributed system is what provides the 'channel_layer' attribute(an instance of Channel_Layer class)
            '''
            await self.channel_layer.group_add(self.room, 
            self.channel_name
            )
        await self.accept()# accepts the incoming connection here, afterwards (whether or not a room is specified.)
       

    async def receive(self, text_data):
        '''
        this receives a text data from the websocket frontend, and broadcasts it to the room which will be specified(the room name store in the 'room' variable above.)
        It also send back the event broadcasted into the group to a receiver function that sends it back to the user's websocket
        '''
        self.data= json.loads(text_data)#parse the data to text, since the frontend will stringify it with json
        print(self.data)
        # do some check as to whether the messages received is an offer, answer, or any other text
        if self.data.get('offer'):
            await self.send(self.data.get(json.dumps('offer')))#sends the offer directly to the receiving user, and not group
        elif self.data.get('answer'):
            await self.send(json.dumps('answer'))
        else:
            '''
            broadcast other things to the group
            '''
            await self.channel_layer.group_send(self.room,{
                #the group_send method on channel layers takes 2 arguements (1 is the room it should send the event to, and two is the dictionary of the event to be sent)
                'type': 'user.recv', #this is the actual listener that is meant to send back the message to the websocket from the user who sends it at first, so that the websocket 'onmessage' event, can take it and handle it for the user too.
                'user': self.user,
                'message': self.data,
            })

    async def user_recv(self, event):
        '''
        the actual method that takes the event broadcasted by the 'group_rcv' method. This is the method specified in the 'type' key
        of the event meant to be sent to the room. It takes the entire event that is sent to the room, and sends it back to the websocket object of the user,
        so that the 'onmessage' event of the user's websocket can take it, and handle display it to the user as well (as if saying 'here is what you sent to everybody in the group')
        '''
        print(event)
        await self.send(json.dumps(event))

    
    async def disconnect_user(self, event):
        '''
        Takes the disconnection event from the user.
        I have no reason to delibrately disconnect a user, so I expect that the users may arbitrarilly want to disconnect.
        '''
        await self.channel_layer.group_discard(#removes user from the room first, before disconnection.
            self.room, 
            self.channel_name
        )
        # self.incoming_users.remove(self.user)#remove the user disconnecting from the list of users first, before disconnecting
        await self.disconnect(event)