import random
import os
import json
import logging
from datetime import timedelta
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from email.mime.image import MIMEImage
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from .models import Login
import threading

# Set up logging
logger = logging.getLogger(__name__)

# Memory caches for ultra-fast performance
_OTP_CACHE = {}
_PASSWORD_CACHE = {}

# ============================================================================
# ULTRA-FAST OTP FUNCTIONS (OPTIMIZED VERSIONS)
# ============================================================================

def generate_otp_instantly():
    """Generate OTP without database overhead"""
    return str(random.randint(100000, 999999))

# views.py - FIX THIS LINE
def send_email_async_ultra_fast(subject, recipient_email, empid=None, otp=None, user_name=None):
    """Simplified, reliable email sending with embedded HTML"""
    def send():
        try:
            print(f"📧 SIMPLIFIED: Sending email to {recipient_email}")
            print(f"🔐 OTP being sent: {otp}")
            
            # Use the actual OTP value, not a placeholder
            actual_otp = otp or "000000"
            
            # Create beautiful HTML email template with ACTUAL OTP
            email_html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Gate Pass OTP</title>
                <style>
                    /* Reset and base styles */
                    * {{
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }}
                    
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        min-height: 100vh;
                    }}
                    
                    .email-container {{
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }}
                    
                    .header {{
                        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }}
                    
                    .logo {{
                        font-size: 48px;
                        margin-bottom: 15px;
                    }}
                    
                    .logo-text {{
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }}
                    
                    .college-name {{
                        font-size: 14px;
                        opacity: 0.9;
                        margin-top: 5px;
                    }}
                    
                    .content {{
                        padding: 40px;
                    }}
                    
                    .greeting {{
                        color: #2c3e50;
                        font-size: 22px;
                        margin-bottom: 20px;
                        font-weight: 600;
                    }}
                    
                    .message {{
                        color: #555;
                        font-size: 16px;
                        margin-bottom: 30px;
                        line-height: 1.8;
                    }}
                    
                    .otp-container {{
                        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                        border-radius: 15px;
                        padding: 30px;
                        text-align: center;
                        margin: 30px 0;
                        border: 2px dashed #3498db;
                    }}
                    
                    .otp-label {{
                        font-size: 16px;
                        color: #7f8c8d;
                        margin-bottom: 15px;
                        display: block;
                    }}
                    
                    .otp-code {{
                        font-size: 48px;
                        font-weight: bold;
                        color: #2c3e50;
                        letter-spacing: 10px;
                        font-family: monospace;
                        background: white;
                        padding: 15px 30px;
                        border-radius: 10px;
                        display: inline-block;
                        margin: 10px 0;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }}
                    
                    .timer {{
                        font-size: 14px;
                        color: #e74c3c;
                        margin-top: 15px;
                        font-weight: 600;
                    }}
                    
                    .instructions {{
                        background: #f8f9fa;
                        border-left: 4px solid #2ecc71;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 30px;
                    }}
                    
                    .instructions h3 {{
                        color: #2c3e50;
                        margin-bottom: 10px;
                        font-size: 18px;
                    }}
                    
                    .instructions ul {{
                        list-style: none;
                        padding-left: 0;
                    }}
                    
                    .instructions li {{
                        margin-bottom: 10px;
                        padding-left: 25px;
                        position: relative;
                    }}
                    
                    .instructions li:before {{
                        content: "✓";
                        color: #2ecc71;
                        position: absolute;
                        left: 0;
                        font-weight: bold;
                    }}
                    
                    .security-warning {{
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 10px;
                        padding: 20px;
                        margin-top: 30px;
                        color: #856404;
                    }}
                    
                    .security-icon {{
                        font-size: 24px;
                        margin-right: 10px;
                        vertical-align: middle;
                    }}
                    
                    .footer {{
                        background: #2c3e50;
                        color: white;
                        padding: 25px;
                        text-align: center;
                        font-size: 14px;
                    }}
                    
                    .footer a {{
                        color: #3498db;
                        text-decoration: none;
                    }}
                    
                    .footer a:hover {{
                        text-decoration: underline;
                    }}
                    
                    /* Responsive design */
                    @media (max-width: 600px) {{
                        .content {{
                            padding: 25px;
                        }}
                        
                        .otp-code {{
                            font-size: 36px;
                            letter-spacing: 8px;
                            padding: 12px 20px;
                        }}
                        
                        .greeting {{
                            font-size: 20px;
                        }}
                    }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="logo">🔐</div>
                        <div class="logo-text">Gate Pass System</div>
                        <div class="college-name">SVR Engineering College</div>
                    </div>
                    
                    <!-- Content -->
                    <div class="content">
                        <h1 class="greeting">Hello {user_name or 'User'},</h1>
                        
                        <p class="message">
                            You have requested to change your password for the Gate Pass System. 
                            Please use the One-Time Password (OTP) below to verify your identity and proceed.
                        </p>
                        
                        <!-- OTP Display -->
                        <div class="otp-container">
                            <span class="otp-label">Your One-Time Password:</span>
                            <div class="otp-code">{actual_otp}</div>
                            <div class="timer">⏳ Valid for 10 minutes</div>
                        </div>
                        
                        <!-- Instructions -->
                        <div class="instructions">
                            <h3>📋 What to do next:</h3>
                            <ul>
                                <li>Enter this OTP on the password change page</li>
                                <li>Create a strong new password (min. 6 characters)</li>
                                <li>Do not share this OTP with anyone</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <!-- Security Warning -->
                        <div class="security-warning">
                            <span class="security-icon">⚠️</span>
                            <strong>Security Notice:</strong> This OTP is confidential. 
                            College staff will never ask for your OTP or password. 
                            If you suspect any unauthorized activity, please contact the system administrator immediately.
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p>© 2024 SVR Engineering College Gate Pass System. All rights reserved.</p>
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>For assistance, contact: <a href="mailto:admin@svrec.ac.in">admin@svrec.ac.in</a></p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # 1. Create email
            msg = EmailMultiAlternatives(
                subject=subject,
                body=f"Your OTP is: {actual_otp}. Use this to change your password. OTP is valid for 10 minutes.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email],
            )
            msg.attach_alternative(email_html, "text/html")
            
            # 2. Try to send with minimal settings
            try:
                print("🔄 Attempting to send email...")
                msg.send(fail_silently=False)
                print(f"✅ Email sent successfully to {recipient_email}")
                print(f"📧 OTP in email: {actual_otp}")
                return
                
            except Exception as send_error:
                print(f"⚠️ First send attempt failed: {send_error}")
                
                # 3. Try alternative: Use console backend for debugging
                print("🔄 Trying alternative method...")
                from django.core.mail import get_connection
                
                # Create a fresh connection
                connection = get_connection(
                    backend='django.core.mail.backends.smtp.EmailBackend',
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=settings.EMAIL_USE_TLS,
                    timeout=30,
                )
                
                # Send using the connection
                connection.open()  # Explicitly open connection
                msg.connection = connection
                msg.send()
                connection.close()
                
                print(f"✅ Email sent via alternative method to {recipient_email}")
                
        except Exception as e:
            print(f"❌ All email attempts failed for {recipient_email}: {str(e)}")
            print(f"📝 OTP was generated but email failed. Check SMTP settings.")
            print(f"📝 For testing, OTP for {user_name or 'user'} is: {otp}")
            
            # Log the error
            import traceback
            traceback.print_exc()
            
    # Start thread
    import threading
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
    return True

def create_otp_email_fast(user_name, otp, purpose="password_change"):
    """Create minimal email HTML for speed"""
    if purpose == "password_change":
        title = "Password Change OTP - Gate Pass"
        message = "Use this OTP to change your password:"
    elif purpose == "first_login":
        title = "First Login OTP - Gate Pass"
        message = "Use this OTP for first-time login:"
    else:  # forgot_password
        title = "Password Reset OTP - Gate Pass"
        message = "Use this OTP to reset your password:"
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f6fb; padding:30px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:14px; padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.15);">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="cid:logo" style="width:120px; margin-bottom:10px;" />
          </div>
          
          <h2 style="color:#2b5cff;text-align:center;margin-bottom:25px;">
            {title}
          </h2>
          
          <p>Hello <b>{user_name}</b>,</p>
          <p>{message}</p>
          
          <h1 style="font-size:32px;letter-spacing:10px;color:#000;background:#f5f7fa;padding:15px;text-align:center;border-radius:8px;margin:25px 0;">
            {otp}
          </h1>
          
          <p><small>Valid for 10 minutes • SVR Engineering College Gate Pass</small></p>
          
          <p style="color: #ff0000; font-weight: bold;">
            ⚠️ If you didn't request this password change, please contact the administrator immediately.
          </p>
          
          <hr style="margin:30px 0;">
          <p style="font-size:12px;color:gray;text-align:center;">
            SVR Engineering College Gate Pass System
          </p>
        </div>
      </body>
    </html>
    """

# In your views.py, add these debug prints to the function:


@api_view(['POST'])
@csrf_exempt
def send_otp_for_password_change_ultrafast(request):
    """ULTRA-FAST OTP SEND - Complete working version"""
    try:
        print("=" * 60)
        print("🚀 send_otp_for_password_change_ultrafast CALLED!")
        print("=" * 60)

        body = request.body
        if not body:
            return Response({"status": False, "message": "Empty request"})

        data = json.loads(body)
        empid = data.get('empid', '').strip()

        if not empid:
            return Response({"status": False, "message": "Employee ID required"})

        print(f"🎯 Processing OTP request for empid: {empid}")

        try:
            user = Login.objects.get(empid=empid)
        except Login.DoesNotExist:
            return Response({"status": False, "message": "Employee not found"})

        # STEP 1: Generate OTP
        otp = generate_otp_instantly()
        print(f"🔐 Generated OTP: {otp}")

        # STEP 2: SAVE OTP IN DATABASE
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save(update_fields=['otp', 'otp_created_at'])

        # STEP 3: SAVE OTP IN CACHE
        cache_key = f"otp_{empid}"
        _OTP_CACHE[cache_key] = {
            "otp": otp,
            "created_at": timezone.now()
        }

        # STEP 4: SEND EMAIL using the new function
        send_email_async_ultra_fast(
            subject=f"Password Change OTP - Gate Pass",
            recipient_email=user.email,
            empid=empid,
            otp=otp,  # Pass the actual OTP
            user_name=user.empname
        )

        print(f"✅ OTP SAVED & EMAIL QUEUED for {empid}")
        print(f"📧 Email queued for: {user.email}")
        print(f"🔐 ACTUAL OTP: {otp}")

        return Response({
            "status": True,
            "message": "OTP generated and email sent",
            "empid": empid,
            "email": user.email,
            "empname": user.empname,
            "debug_info": f"Check console for OTP: {otp}"
        })

    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"status": False, "message": "System error"})

@api_view(['POST'])
@csrf_exempt
def verify_otp_for_password_change_ultrafast(request):
    """ULTRA-FAST OTP VERIFICATION - Checks cache first, then DB"""
    try:
        body = request.body
        if not body:
            return Response({"status": False, "message": "Empty request"})
        
        data = json.loads(body)
        empid = data.get("empid", "").strip()
        otp_input = data.get("otp", "").strip()
        
        print(f"🔍 Verifying OTP for {empid}, input: {otp_input}")
        
        if not empid or not otp_input:
            return Response({"status": False, "message": "EmpID and OTP required"})
        
        cache_key = f"otp_{empid}"
        
        # STEP 1: Check cache first (instant)
        if cache_key in _OTP_CACHE:
            cached_data = _OTP_CACHE[cache_key]
            
            print(f"🔍 Found in cache: {cached_data['otp']}")
            
            # Check expiration (10 minutes)
            if timezone.now() > cached_data['created_at'] + timedelta(minutes=10):
                del _OTP_CACHE[cache_key]
                print(f"⏰ OTP expired in cache for {empid}")
                return Response({"status": False, "message": "OTP expired"})
            
            if cached_data['otp'] == otp_input:
                print(f"✅ OTP verified via cache for {empid}")
                # Get user info
                user = Login.objects.only('empname', 'email', 'role', 'department').get(empid=empid)
                
                # Clear cache
                del _OTP_CACHE[cache_key]
                
                # Clear DB OTP
                user.otp = None
                user.otp_created_at = None
                user.save(update_fields=['otp', 'otp_created_at'])
                
                return Response({
                    "status": True,
                    "message": "OTP verified successfully",
                    "empname": user.empname,
                    "email": user.email,
                    "role": user.role,
                    "department": user.department
                })
        
        # STEP 2: Fallback to database check
        print(f"🔍 Checking database for OTP of {empid}")
        try:
            user = Login.objects.only('otp', 'otp_created_at', 'empname', 'email', 'role', 'department').get(empid=empid)
            
            print(f"🔍 DB OTP: {user.otp}, Created at: {user.otp_created_at}")
            
            if not user.otp:
                return Response({"status": False, "message": "No OTP found"})
            
            if not user.otp_created_at or timezone.now() > user.otp_created_at + timedelta(minutes=10):
                user.otp = None
                user.otp_created_at = None
                user.save(update_fields=['otp', 'otp_created_at'])
                return Response({"status": False, "message": "OTP expired"})
            
            if user.otp == otp_input:
                print(f"✅ OTP verified via database for {empid}")
                # Clear OTP
                user.otp = None
                user.otp_created_at = None
                user.save(update_fields=['otp', 'otp_created_at'])
                
                # Clear from cache if exists
                _OTP_CACHE.pop(cache_key, None)
                
                return Response({
                    "status": True,
                    "message": "OTP verified successfully",
                    "empname": user.empname,
                    "email": user.email,
                    "role": user.role,
                    "department": user.department
                })
            else:
                print(f"❌ Invalid OTP for {empid}")
                return Response({"status": False, "message": "Invalid OTP"})
                
        except Login.DoesNotExist:
            print(f"❌ User not found: {empid}")
            return Response({"status": False, "message": "User not found"})
            
    except Exception as e:
        logger.error(f"OTP verify error: {str(e)}")
        print(f"❌ Verification error: {str(e)}")
        return Response({"status": False, "message": "Verification error"})

@api_view(['POST'])
@csrf_exempt
def resend_otp_ultrafast(request):
    """Resend OTP using ultra-fast method"""
    try:
        body = request.body
        if not body:
            return Response({"status": False, "message": "Empty request"})
        
        data = json.loads(body)
        empid = data.get('empid', '').strip()
        
        if not empid:
            return Response({"status": False, "message": "Employee ID required"})
        
        print(f"🔄 Resending OTP for empid: {empid}")
        
        # Call the same function as initial send
        return send_otp_for_password_change_ultrafast(request)
        
    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}")
        return Response({"status": False, "message": "Resend failed"})

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def send_email_with_logo(subject, html_content, recipient_email, user_name=None):
    """Helper function to send email with logo"""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body="",  # Plain text version
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Attach logo
        logo_path = os.path.join(settings.BASE_DIR, "app1/static/app1/svr_logo.png")
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<logo>")
                img.add_header("Content-Disposition", "inline", filename="logo.png")
                msg.attach(img)
        else:
            logger.warning(f"Logo file not found at: {logo_path}")
            print(f"⚠️ Logo file not found at: {logo_path}")
        
        msg.send()
        logger.info(f"✅ Email sent successfully to {recipient_email}")
        print(f"✅ Email sent successfully to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {recipient_email}: {str(e)}")
        print(f"❌ Failed to send email to {recipient_email}: {str(e)}")
        return False

def create_email_template(title, user_name, otp=None, message=None, is_password_change=False):
    """Create email HTML template"""
    if otp:
        otp_section = f"""
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="
            text-align:center;
            letter-spacing:6px;
            color:#000;
            background:#f4f6fb;
            padding:18px;
            border-radius:10px;
            margin:30px 0;
        ">
            {otp}
        </h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        """
    else:
        otp_section = ""
    
    if message:
        message_section = f"<p>{message}</p>"
    else:
        message_section = ""
    
    if is_password_change:
        security_warning = """
        <p style="color: #ff0000; font-weight: bold;">
            ⚠️ If you didn't request this password change, please contact the administrator immediately.
        </p>
        """
    else:
        security_warning = ""
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f6fb; padding:30px;">
        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            border-radius:14px;
            padding:40px;
            box-shadow:0 10px 30px rgba(0,0,0,0.15);
        ">
          <div style="text-align:center; margin-bottom:20px;">
            <img src="cid:logo" style="width:120px; margin-bottom:10px;" />
          </div>

          <h2 style="color:#2b5cff;text-align:center;margin-bottom:25px;">
            {title}
          </h2>

          <p>Hello <b>{user_name}</b>,</p>
          {message_section}
          {otp_section}
          {security_warning}

          <p>If you did not request this, please ignore.</p>

          <hr style="margin:30px 0;">

          <p style="font-size:12px;color:gray;text-align:center;">
            SVR Engineering College Gate Pass System
          </p>
        </div>
      </body>
    </html>
    """

def generate_and_send_otp(user, purpose="verification"):
    """Helper function to generate and send OTP"""
    try:
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()
        
        logger.info(f"Generated OTP {otp} for user {user.empid} ({user.empname}) for {purpose}")
        
        # Determine email content based on purpose
        if purpose == "password_change":
            title = "Password Change Request - Gate Pass App"
            subject = "Password Change Request - Gate Pass App"
            message = "You have requested to change your password. Please use the OTP below to verify your identity."
            is_password_change = True
        elif purpose == "first_login":
            title = "Gate Pass OTP Verification"
            subject = "Gate Pass OTP Verification"
            message = "This is your OTP for first-time login verification."
            is_password_change = False
        else:  # forgot_password
            title = "Gate Pass Password Reset OTP"
            subject = "Gate Pass Password Reset OTP"
            message = "You have requested to reset your password. Please use the OTP below."
            is_password_change = False
        
        # Create email content
        html_content = create_email_template(
            title=title,
            user_name=user.empname,
            otp=otp,
            message=message,
            is_password_change=is_password_change
        )
        
        # Send email
        email_sent = send_email_with_logo(
            subject=subject,
            html_content=html_content,
            recipient_email=user.email,
            user_name=user.empname
        )
        
        return email_sent, otp
        
    except Exception as e:
        logger.error(f"Error in generate_and_send_otp for user {user.empid}: {str(e)}")
        return False, None

# ============================================================================
# MAIN AUTHENTICATION FUNCTIONS
# ============================================================================

@api_view(['POST'])
def login_view(request):
    """Handle user login"""
    empid = request.data.get('empid')
    password = request.data.get('password')

    if not empid or not password:
        return Response({"status": False, "message": "EmpID and Password required"})

    try:
        user = Login.objects.get(empid=empid)

        # ✅ FIRST TIME LOGIN (password equals empid)
        if user.password == empid:
            email_sent, otp = generate_and_send_otp(user, "first_login")
            
            if not email_sent:
                return Response({
                    "status": False,
                    "message": "Failed to send OTP email. Please try again."
                })

            return Response({
                "status": "otp",
                "message": "OTP sent to your email for first-time login",
                "empid": empid,
                "email": user.email,
                "empname": user.empname
            })

        # ❌ WRONG PASSWORD
        if user.password != password:
            return Response({"status": False, "message": "Invalid password"})

        # ✅ NORMAL LOGIN - SUCCESS
        return Response({
            "status": True,
            "message": "Login successful",
            "role": user.role,
            "department": user.department,
            "empname": user.empname,
            "email": user.email,
            "empid": empid
        })

    except Login.DoesNotExist:
        logger.warning(f"Login attempt for non-existent empid: {empid}")
        return Response({
            "status": False,
            "message": "Employee not found. Please contact administrator."
        })

@api_view(['POST'])
def verify_otp(request):
    """Verify OTP for first-time login"""
    empid = request.data.get("empid")
    otp = request.data.get("otp")

    if not empid or not otp:
        return Response({"status": False, "message": "EmpID and OTP required"})

    try:
        user = Login.objects.get(empid=empid)
        
        # Check if OTP exists
        if not user.otp:
            return Response({"status": False, "message": "No OTP found. Please request a new one."})
        
        # Check OTP expiration (10 minutes)
        if not user.otp_created_at or timezone.now() > user.otp_created_at + timedelta(minutes=10):
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({"status": False, "message": "OTP has expired. Please request a new one."})
        
        # Verify OTP
        if user.otp == otp:
            # Clear OTP after successful verification
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({
                "status": True,
                "message": "OTP verified successfully",
                "empname": user.empname,
                "email": user.email,
                "role": user.role,
                "department": user.department
            })
        else:
            return Response({"status": False, "message": "Invalid OTP"})

    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})

@api_view(['POST'])
def change_password(request):
    """Change password after first-time OTP verification"""
    empid = request.data.get("empid")
    new_password = request.data.get("password")

    if not empid or not new_password:
        return Response({"status": False, "message": "All fields are required"})

    try:
        user = Login.objects.get(empid=empid)

        # Check if password is same as empid
        if new_password == empid:
            return Response({"status": False, "message": "Password cannot be same as Employee ID"})

        # Update password
        user.password = new_password
        user.save()

        return Response({
            "status": True, 
            "message": "Password changed successfully. You can now login with your new password."
        })

    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})

@api_view(['POST'])
def forgot_password(request):
    """Handle forgot password request"""
    empid = request.data.get("empid")

    if not empid:
        return Response({"status": False, "message": "EmpID is required"})

    try:
        user = Login.objects.get(empid=empid)
        
        email_sent, otp = generate_and_send_otp(user, "forgot_password")
        
        if not email_sent:
            return Response({
                "status": False,
                "message": "Failed to send OTP email. Please try again."
            })

        return Response({
            "status": True,
            "message": "OTP sent to your registered email",
            "empid": empid,
            "email": user.email,
            "empname": user.empname
        })

    except Login.DoesNotExist:
        logger.warning(f"Forgot password attempt for non-existent empid: {empid}")
        return Response({"status": False, "message": "Employee not found"})

# ============================================================================
# COMPATIBILITY FUNCTIONS
# ============================================================================

@api_view(['POST'])
def send_otp_for_password_change(request):
    """Send OTP for password change request from dashboard"""
    empid = request.data.get('empid')
    
    if not empid:
        return Response({"status": False, "message": "Employee ID is required"})
    
    try:
        user = Login.objects.get(empid=empid)
        
        email_sent, otp = generate_and_send_otp(user, "password_change")
        
        if not email_sent:
            return Response({
                "status": False,
                "message": "Failed to send OTP email. Please check your email configuration or try again."
            })

        return Response({
            "status": True,
            "message": "OTP sent to your registered email",
            "empid": empid,
            "email": user.email,
            "empname": user.empname,
            "role": user.get_role_display(),
            "department": user.department
        })
        
    except Login.DoesNotExist:
        logger.error(f"send_otp_for_password_change: Employee not found - {empid}")
        return Response({"status": False, "message": "Employee not found"})
    except Exception as e:
        logger.error(f"Error in send_otp_for_password_change: {str(e)}")
        return Response({"status": False, "message": f"Error: {str(e)}"})

@api_view(['POST'])
def verify_otp_for_password_change(request):
    """Verify OTP for password change from dashboard"""
    empid = request.data.get("empid")
    otp = request.data.get("otp")
    
    if not empid or not otp:
        return Response({"status": False, "message": "EmpID and OTP are required"})
    
    try:
        user = Login.objects.get(empid=empid)
        
        # Check if OTP exists
        if not user.otp:
            return Response({"status": False, "message": "No OTP found. Please request a new one."})
        
        # Check OTP expiration
        if not user.otp_created_at or timezone.now() > user.otp_created_at + timedelta(minutes=10):
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({"status": False, "message": "OTP has expired. Please request a new one."})
        
        # Verify OTP
        if user.otp == otp:
            # Keep OTP for password change step
            return Response({
                "status": True,
                "message": "OTP verified successfully",
                "empname": user.empname,
                "email": user.email,
                "role": user.get_role_display(),
                "department": user.department
            })
        else:
            return Response({"status": False, "message": "Invalid OTP"})
            
    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})

@api_view(['POST'])
def resend_otp_for_password_change(request):
    """Resend OTP for password change"""
    empid = request.data.get("empid")
    
    if not empid:
        return Response({"status": False, "message": "Employee ID is required"})
    
    try:
        user = Login.objects.get(empid=empid)
        
        email_sent, otp = generate_and_send_otp(user, "password_change")
        
        if not email_sent:
            return Response({
                "status": False,
                "message": "Failed to resend OTP email. Please try again."
            })

        return Response({
            "status": True,
            "message": "New OTP sent to your email",
            "empid": empid,
            "email": user.email,
            "empname": user.empname
        })
        
    except Login.DoesNotExist:
        return Response({"status": False, "message": "Employee not found"})

# ============================================================================
# PASSWORD UPDATE FUNCTION
# ============================================================================


@api_view(['POST'])
@csrf_exempt
def update_password_from_dashboard(request):
    """Password update for dashboard - NO OTP required"""
    try:
        print("=" * 60)
        print("🔄 update_password_from_dashboard CALLED!")
        print("=" * 60)
        
        # Get data directly
        data = request.data
        empid = data.get("empid", "").strip()
        new_password = data.get("new_password", "").strip()
        confirm_password = data.get("confirm_password", "").strip()
        
        print(f"📥 Received data: empid={empid}, new_pass_len={len(new_password)}, confirm_pass_len={len(confirm_password)}")
        print(f"🔑 New password (first 2 chars): {new_password[:2]}...")
        print(f"🔐 Confirm password (first 2 chars): {confirm_password[:2]}...")
        
        # Fast validation
        if not empid or not new_password or not confirm_password:
            print("❌ Missing fields")
            return Response({"status": False, "message": "All fields are required"})
        
        if new_password != confirm_password:
            print("❌ Passwords don't match")
            return Response({"status": False, "message": "Passwords don't match"})
        
        if len(new_password) < 6:
            print("❌ Password too short")
            return Response({"status": False, "message": "Password must be at least 6 characters"})
        
        try:
            user = Login.objects.get(empid=empid)
            print(f"✅ User found: {user.empname}")
            print(f"📧 User email: {user.email}")
            
            # Check if password is same as empid
            if new_password == empid:
                print("❌ Password cannot be same as EmpID")
                return Response({"status": False, "message": "Password cannot be same as Employee ID"})
            
            # Check if same as current password
            if new_password == user.password:
                print("❌ Password cannot be same as current password")
                return Response({"status": False, "message": "New password cannot be same as current password"})
            
            # Update password
            user.password = new_password
            user.save()
            
            print(f"✅ Password updated successfully for: {empid}")
            print("=" * 60)
            
            return Response({
                "status": True,
                "message": "Password updated successfully!"
            })
            
        except Login.DoesNotExist:
            print(f"❌ User not found: {empid}")
            return Response({"status": False, "message": "User not found"})
            
    except Exception as e:
        print(f"❌ Error in update_password_from_dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"status": False, "message": "System error occurred"})

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

@api_view(['GET'])
def get_user_details(request, empid):
    """Get user details for dashboard"""
    try:
        user = Login.objects.get(empid=empid)
        
        return Response({
            "status": True,
            "data": {
                "empname": user.empname,
                "email": user.email,
                "role": user.role,
                "department": user.department,
                "display_role": user.get_role_display()
            }
        })
        
    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})

@api_view(['POST'])
def validate_current_password(request):
    """Validate current password before allowing password change"""
    empid = request.data.get("empid")
    current_password = request.data.get("current_password")
    
    if not empid or not current_password:
        return Response({"status": False, "message": "Employee ID and current password are required"})
    
    try:
        user = Login.objects.get(empid=empid)
        
        if user.password != current_password:
            return Response({"status": False, "message": "Current password is incorrect"})
        
        return Response({"status": True, "message": "Password verified"})
        
    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})

@api_view(['POST'])
@csrf_exempt
def get_previous_password(request):
    """ULTRA-FAST previous password check with caching"""
    try:
        # Direct JSON parsing for speed
        body = request.body
        if not body:
            return Response({"status": False, "message": "Empty request"})
        
        data = json.loads(body)
        empid = data.get('empid', '').strip()
        
        if not empid:
            return Response({"status": False, "message": "Employee ID required"})
        
        # Check cache first (instant response)
        cache_key = f"pass_{empid}"
        if cache_key in _PASSWORD_CACHE:
            return Response({
                "status": True,
                "previous_password": _PASSWORD_CACHE[cache_key]
            })
        
        # Fast DB query - select only password field
        try:
            user = Login.objects.only('password').get(empid=empid)
            password = user.password
            
            # Cache it
            _PASSWORD_CACHE[cache_key] = password
            
            return Response({
                "status": True,
                "previous_password": password
            })
        except Login.DoesNotExist:
            return Response({"status": False, "message": "User not found"})
            
    except Exception:
        return Response({"status": False, "message": "Request error"})

@api_view(['POST'])
@csrf_exempt
def test_email_config(request):
    """Test email configuration"""
    try:
        data = json.loads(request.body)
        test_email = data.get('email')
        
        if not test_email:
            return Response({"status": False, "message": "Email required"})
        
        # Test with a simple email
        test_content = """
        <div style="padding:20px; text-align:center;">
            <h3 style="color:#2b5cff;">Email Test - Gate Pass System</h3>
            <p>If you receive this email, your email configuration is working correctly.</p>
            <p><small>SVR Engineering College Gate Pass System</small></p>
        </div>
        """
        
        msg = EmailMultiAlternatives(
            subject="Test Email - Gate Pass System",
            body="Test email body",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[test_email],
        )
        msg.attach_alternative(test_content, "text/html")
        
        # Try to send
        msg.send(fail_silently=False)
        
        return Response({
            "status": True,
            "message": f"Test email sent to {test_email}"
        })
        
    except Exception as e:
        return Response({
            "status": False,
            "message": f"Email test failed: {str(e)}"
        })
    # Add to views.py
@api_view(['POST'])
@csrf_exempt
def debug_otp_send(request):
    """Debug endpoint for OTP sending"""
    print("=" * 60)
    print("🔧 DEBUG OTP SEND ENDPOINT CALLED")
    print("=" * 60)
    
    try:
        body = request.body
        data = json.loads(body)
        empid = data.get('empid', '').strip()
        
        print(f"📋 Received empid: {empid}")
        
        # Try to find user
        try:
            user = Login.objects.get(empid=empid)
            print(f"✅ User found: {user.empname}")
            print(f"📧 User email: {user.email}")
            print(f"👤 User role: {user.role}")
            
            # Generate OTP
            otp = str(random.randint(100000, 999999))
            print(f"🔐 Generated OTP: {otp}")
            
            # Update user
            user.otp = otp
            user.otp_created_at = timezone.now()
            user.save()
            
            return Response({
                "status": True,
                "message": "Debug - OTP generated and saved",
                "empid": empid,
                "email": user.email,
                "empname": user.empname,
                "otp": otp
            })
            
        except Login.DoesNotExist:
            print(f"❌ User not found: {empid}")
            return Response({
                "status": False,
                "message": f"User with empid {empid} not found"
            })
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return Response({
            "status": False,
            "message": f"Error: {str(e)}"
        })