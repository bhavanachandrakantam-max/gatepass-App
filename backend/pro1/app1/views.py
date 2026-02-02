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
# ULTRA-FAST OTP FUNCTIONS (NEW OPTIMIZED VERSIONS)
# ============================================================================

def generate_otp_instantly():
    """Generate OTP without database overhead"""
    return str(random.randint(100000, 999999))

def send_email_async_ultra_fast(subject, html_content, recipient_email, empid=None):
    """Send email in background with zero wait time"""
    def send():
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email],
            )
            msg.content_subtype = "html"
            msg.send(fail_silently=True)
            
            if empid:
                logger.info(f"✅ Email sent to {empid} in background")
        except Exception as e:
            logger.error(f"❌ Background email failed: {str(e)}")
    
    threading.Thread(target=send, daemon=True).start()
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
    <div style="padding:20px;font-family:Arial,sans-serif;">
        <h3 style="color:#2b5cff;">{title}</h3>
        <p>Hello <b>{user_name}</b>,</p>
        <p>{message}</p>
        <h1 style="font-size:32px;letter-spacing:10px;color:#000;background:#f5f7fa;padding:15px;text-align:center;border-radius:8px;margin:25px 0;">
            {otp}
        </h1>
        <p><small>Valid for 10 minutes • SVR Engineering College Gate Pass</small></p>
    </div>
    """

@api_view(['POST'])
@csrf_exempt
def send_otp_for_password_change_ultrafast(request):
    """ULTRA-FAST OTP SEND - Returns immediately, sends email in background"""
    try:
        body = request.body
        if not body:
            return Response({"status": False, "message": "Empty request"})
        
        data = json.loads(body)
        empid = data.get('empid', '').strip()
        
        if not empid:
            return Response({"status": False, "message": "Employee ID required"})
        
        # Step 1: Generate OTP INSTANTLY
        otp = generate_otp_instantly()
        
        # Step 2: Store in cache immediately (response in < 50ms)
        cache_key = f"otp_{empid}"
        _OTP_CACHE[cache_key] = {
            'otp': otp,
            'created_at': timezone.now(),
            'empid': empid,
            'purpose': 'password_change'
        }
        
        # Step 3: Get user info WITHOUT waiting for email
        try:
            user = Login.objects.only('empname', 'email').get(empid=empid)
            
            # Step 4: Send email in background WITHOUT waiting
            email_content = create_otp_email_fast(
                user_name=user.empname,
                otp=otp,
                purpose="password_change"
            )
            
            send_email_async_ultra_fast(
                subject="Password Change OTP - Gate Pass",
                html_content=email_content,
                recipient_email=user.email,
                empid=empid
            )
            
            # Step 5: Save to database in background (for persistence)
            threading.Thread(
                target=save_otp_to_db,
                args=(empid, otp, 'password_change'),
                daemon=True
            ).start()
            
            # RESPONSE SENT IN UNDER 100ms!
            return Response({
                "status": True,
                "message": "OTP sent to your email",
                "empid": empid,
                "email": user.email,
                "empname": user.empname
            })
            
        except Login.DoesNotExist:
            return Response({"status": False, "message": "Employee not found"})
            
    except Exception as e:
        logger.error(f"OTP send error: {str(e)}")
        return Response({"status": False, "message": "System error"})

def save_otp_to_db(empid, otp, purpose="password_change"):
    """Save OTP to database in background"""
    try:
        user = Login.objects.get(empid=empid)
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save(update_fields=['otp', 'otp_created_at'])
    except Exception as e:
        logger.error(f"Background OTP save failed: {str(e)}")

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
        
        if not empid or not otp_input:
            return Response({"status": False, "message": "EmpID and OTP required"})
        
        cache_key = f"otp_{empid}"
        
        # STEP 1: Check cache first (instant)
        if cache_key in _OTP_CACHE:
            cached_data = _OTP_CACHE[cache_key]
            
            # Check expiration (10 minutes)
            if timezone.now() > cached_data['created_at'] + timedelta(minutes=10):
                del _OTP_CACHE[cache_key]
                return Response({"status": False, "message": "OTP expired"})
            
            if cached_data['otp'] == otp_input:
                # Get user info
                user = Login.objects.only('empname', 'email', 'role', 'department').get(empid=empid)
                
                # Clear cache
                del _OTP_CACHE[cache_key]
                
                # Clear DB OTP in background
                threading.Thread(
                    target=clear_otp_from_db,
                    args=(empid,),
                    daemon=True
                ).start()
                
                return Response({
                    "status": True,
                    "message": "OTP verified successfully",
                    "empname": user.empname,
                    "email": user.email,
                    "role": user.role,
                    "department": user.department
                })
        
        # STEP 2: Fallback to database check
        try:
            user = Login.objects.only('otp', 'otp_created_at', 'empname', 'email', 'role', 'department').get(empid=empid)
            
            if not user.otp:
                return Response({"status": False, "message": "No OTP found"})
            
            if not user.otp_created_at or timezone.now() > user.otp_created_at + timedelta(minutes=10):
                user.otp = None
                user.otp_created_at = None
                user.save(update_fields=['otp', 'otp_created_at'])
                return Response({"status": False, "message": "OTP expired"})
            
            if user.otp == otp_input:
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
                return Response({"status": False, "message": "Invalid OTP"})
                
        except Login.DoesNotExist:
            return Response({"status": False, "message": "User not found"})
            
    except Exception as e:
        logger.error(f"OTP verify error: {str(e)}")
        return Response({"status": False, "message": "Verification error"})

def clear_otp_from_db(empid):
    """Clear OTP from database in background"""
    try:
        user = Login.objects.get(empid=empid)
        user.otp = None
        user.otp_created_at = None
        user.save(update_fields=['otp', 'otp_created_at'])
    except Exception:
        pass

# ============================================================================
# ORIGINAL FUNCTIONS (KEPT FOR COMPATIBILITY)
# ============================================================================

def send_email_async(subject, html_content, recipient_email):
    """Send email in background thread - don't wait for it"""
    def send():
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body="",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email],
            )
            msg.attach_alternative(html_content, "text/html")
            
            # Attach logo if exists (but don't wait if file missing)
            logo_path = os.path.join(settings.BASE_DIR, "app1/static/app1/svr_logo.png")
            if os.path.exists(logo_path):
                with open(logo_path, "rb") as f:
                    img = MIMEImage(f.read())
                    img.add_header("Content-ID", "<logo>")
                    msg.attach(img)
            
            msg.send(fail_silently=True)
        except Exception:
            pass  # Email failures shouldn't block user
    
    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()
    return True

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
def update_password_from_dashboard(request):
    """ULTRA-FAST password update - optimized for speed"""
    try:
        # Get data directly
        empid = request.data.get("empid", "").strip()
        new_password = request.data.get("new_password", "").strip()
        confirm_password = request.data.get("confirm_password", "").strip()
        
        # Fast validation
        if not empid or not new_password or not confirm_password:
            return Response({"status": False, "message": "All fields required"})
        
        if new_password != confirm_password:
            return Response({"status": False, "message": "Passwords don't match"})
        
        if len(new_password) < 6:
            return Response({"status": False, "message": "Minimum 6 characters"})
        
        # Atomic transaction for speed and safety
        with transaction.atomic():
            # Select only needed fields
            user = Login.objects.select_for_update().only(
                'password', 'empname', 'otp', 'otp_created_at', 'email'
            ).get(empid=empid)
            
            # FAST password checks
            if new_password == user.password:
                return Response({
                    "status": False, 
                    "message": "Cannot use previous password"
                })
            
            if new_password == empid:
                return Response({"status": False, "message": "Password cannot be EmpID"})
            
            # Basic OTP check
            if not user.otp:
                return Response({"status": False, "message": "Session expired"})
            
            # Update password
            user.password = new_password
            user.otp = None
            user.otp_created_at = None
            user.save()
        
        # Update cache instantly
        _PASSWORD_CACHE[f"pass_{empid}"] = new_password
        
        # Send email in background (don't wait)
        if user.email:
            email_html = f"""
            <div style="padding:20px; text-align:center;">
                <h3 style="color:#2b5cff;">Password Changed Successfully</h3>
                <p>Hello <b>{user.empname}</b>,</p>
                <p>Your password has been updated.</p>
                <p><small>SVR Engineering College Gate Pass System</small></p>
            </div>
            """
            send_email_async(
                subject="Password Updated - Gate Pass",
                html_content=email_html,
                recipient_email=user.email
            )
        
        return Response({
            "status": True,
            "message": "Password updated successfully!"
        })
        
    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})
    except Exception as e:
        logger.error(f"Password update error: {str(e)}")
        return Response({"status": False, "message": "Update failed"})

def send_email_with_logo(subject, html_content, recipient_email, user_name=None):
    """Helper function to send email with logo"""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body="",  # Plain text version (empty since we have HTML)
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
        
        msg.send()
        logger.info(f"✅ Email sent successfully to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {recipient_email}: {str(e)}")
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

# ORIGINAL OTP FUNCTIONS (KEPT FOR COMPATIBILITY)

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