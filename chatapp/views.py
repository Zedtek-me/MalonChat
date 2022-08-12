from django.shortcuts import render
# from django.contrib.auth.decorators import login_required, permission_required #intended for interface restriction.


def index(request):
    '''
    the view to render the initial form for users to specify preffered names, and enter into a room.
    '''
    user= request.user
    return render(request, 'index.html', {'user':user})


def room_view(request, room_name):
    user= request.user
    room_name= room_name
    '''
    this returns the page for the chat itself, where users can connect.
    '''
    return render(request, 'room.html', {'user':user, 'room_name': room_name})
# Create your views here.
