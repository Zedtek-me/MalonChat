"""
ASGI config for chatProject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatProject.settings')
from chatapp.routing import websocket_urls
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack #this is the middleware into which the request enters first; it adds the current authenticated user to the scope, before passing it down to my view.
application = ProtocolTypeRouter({
    '''
    ProtocolTypeRouter's constructor takes a dictionary that specify how to handle the incoming protocol requests (websocket or http)
    '''
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urls)
    )
    #as seen above, http is being handled by the asgi server returned by the 'get_asgi_application' function
    #while websocket is being routed to our 'websocket_urls' in our routing, which directs all connection to our 'UserChat' handler (or view/controller).
})
