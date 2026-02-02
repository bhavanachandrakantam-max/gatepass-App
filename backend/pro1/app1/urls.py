from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('api/login/', views.login_view, name='login'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/change-password/', views.change_password, name='change_password'),
    path('api/forgot-password/', views.forgot_password, name='forgot_password'),
    
    # Password change from dashboard
    path('api/send-otp-for-password-change/', views.send_otp_for_password_change, name='send_otp_for_password_change'),
    path('api/verify-otp-for-password-change/', views.verify_otp_for_password_change, name='verify_otp_for_password_change'),
    path('api/resend-otp-for-password-change/', views.resend_otp_for_password_change, name='resend_otp_for_password_change'),
    path('api/update-password-from-dashboard/', views.update_password_from_dashboard, name='update_password_from_dashboard'),
    
    # User management
    path('api/get-user-details/<str:empid>/', views.get_user_details, name='get_user_details'),
    path('api/validate-current-password/', views.validate_current_password, name='validate_current_password'),
]