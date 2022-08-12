from django.urls import re_path
from chatapp.consumer import UserChats

# this is the main entry point for a chat connection (persistent TCP conn.)
websocket_urls= [
    re_path(r'chat/<str:room_name/$>', UserChats.as_asgi(), name= 'chat handler')
]