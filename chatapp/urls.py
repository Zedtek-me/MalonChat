from django.urls import path
from chatapp.views import *
urlpatterns= [
    path('', index, name='home page'),
    path('room/<str:room_name>/', room_view, name='room')
]