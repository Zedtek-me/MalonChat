from django.db import models
from django.contrib.auth.models import User


# All Tables go here as python classes. I'm using Django ORM here, and I'm going by Django's Default 'User Model Here
class UserProfile(models.Model):
    '''
    This extends the built in User table that comes with django, as its user profile, 
    having other columns as given below.
    '''
    user= models.OneToOneField(User, on_delete=models.CASCADE)
    video_host= models.BooleanField('Started a video', default=False)
    video_guest= models.BooleanField('A video guest?', default=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
class Wallet(models.Model):
    '''
    A table implementing user wallet. 
    It has a one-to-one relationship with the User table, cuze a user should only have one wallet
    '''
    owner= models.OneToOneField(User, on_delete=models.CASCADE)
    wallet_name= models.CharField('user wallet\'s name', max_length=300, unique=True, null=False, blank=False)

    def __str__(self) -> str:
        '''
        tells about the owner of the wallet.
        '''
        return f"{self.owner.username}'s wallet."


class Tip(models.Model):
    '''
    This implements the tips table.
    It has a many to one relationship with the 'Wallet' and 'User Table'. This is so because a wallet could have many tips,
    and a "giver"(or User) could give More than a single tip as well.
    '''
    wallet= models.ForeignKey(Wallet, on_delete=models.CASCADE)
    giver= models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    amount= models.IntegerField('Tip\'s worth', blank=False, null= False, unique=False)
    date_given= models.DateTimeField('When tipped', auto_now_add=True)

    def __str__(self):
        '''
        to return a string representation of the amount given as a tip.
        '''
        return self.amount