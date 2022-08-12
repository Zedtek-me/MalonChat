from django.contrib import admin
from chatapp.models import *
class WalletAdmin(admin.ModelAdmin):
    list_display= ['owner', 'wallet_name']
    list_filter= ['owner', 'wallet_name']
    fields= ['owner', 'wallet_name']
# Register your models here.
admin.site.register([(Wallet, WalletAdmin), User, Tip, UserProfile])
