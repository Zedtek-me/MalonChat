from django.urls import path
from chatapp.consumer import UserChats

# this is the main entry point for a chat connection (persistent TCP conn.)
websocket_urls= [
    path('chat/<str:room_name>/', UserChats.as_asgi(), name= 'chat handler')
]