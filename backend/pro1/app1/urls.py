from django.urls import path
from . import views

urlpatterns = [
    # ============================================================================
    # AUTHENTICATION ENDPOINTS
    # ============================================================================
    path('api/login/', views.login_view, name='login'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/change-password/', views.change_password, name='change_password'),
    path('api/forgot-password/', views.forgot_password, name='forgot_password'),
    
    # ============================================================================
    # ✅ ULTRA-FAST OTP ENDPOINTS (USE THESE FOR OTP FUNCTIONALITY)
    # ============================================================================
    path('api/send-otp-for-password-change-ultrafast/', 
         views.send_otp_for_password_change_ultrafast, 
         name='send_otp_password_change_ultrafast'),
    
    path('api/verify-otp-for-password-change-ultrafast/', 
         views.verify_otp_for_password_change_ultrafast, 
         name='verify_otp_password_change_ultrafast'),
    
    path('api/resend-otp-ultrafast/', 
         views.resend_otp_ultrafast, 
         name='resend_otp_ultrafast'),
    
    # ============================================================================
    # COMPATIBILITY ENDPOINTS (Original OTP endpoints)
    # ============================================================================
    path('api/send-otp-for-password-change/', 
         views.send_otp_for_password_change, 
         name='send_otp_for_password_change'),
    
    path('api/verify-otp-for-password-change/', 
         views.verify_otp_for_password_change, 
         name='verify_otp_for_password_change'),
    
    path('api/resend-otp-for-password-change/', 
         views.resend_otp_for_password_change, 
         name='resend_otp_for_password_change'),
    
    # ============================================================================
    # PASSWORD UPDATE ENDPOINTS
    # ============================================================================
    path('api/update-password-from-dashboard/', 
         views.update_password_from_dashboard, 
         name='update_password_from_dashboard'),
    
    path('api/get-previous-password/', 
         views.get_previous_password, 
         name='get_previous_password'),
    
    # ============================================================================
    # USER MANAGEMENT ENDPOINTS
    # ============================================================================
    path('api/get-user-details/<str:empid>/', 
         views.get_user_details, 
         name='get_user_details'),
    
    path('api/validate-current-password/', 
         views.validate_current_password, 
         name='validate_current_password'),
    
    # ============================================================================
    # TESTING & DEBUGGING ENDPOINTS
    # ============================================================================
    path('api/test-email-config/', 
         views.test_email_config, 
         name='test_email_config'),
     # Add to urls.py
     path('api/debug-otp-send/', views.debug_otp_send, name='debug_otp_send'),
]