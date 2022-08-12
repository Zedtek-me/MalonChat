from django.db.models.signals import post_save
from django.contrib.auth.models import User
from chatapp.models import UserProfile



def create_profile(sender, created, instance, **kwargs):
    '''
    This would be the signal receiver.
    It should automatically create a profile for the user once a user is created (just like an event listener).
    All signals in django sends some properties of their senders along with them; hence, the parameter given above.
    '''
    if created:
        profile= UserProfile.objects.create(user= instance)


post_save.connect(create_profile, User)