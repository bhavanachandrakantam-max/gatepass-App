from django.urls import path
from .views import login_view, verify_otp, change_password

urlpatterns = [
    path("login/", login_view),
    path("verify-otp/", verify_otp),
    path("change-password/", change_password),
]
