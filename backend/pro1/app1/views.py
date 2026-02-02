import random
import os
import logging
from datetime import timedelta
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from email.mime.image import MIMEImage
from .models import Login

# Set up logging
logger = logging.getLogger(__name__)


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


@api_view(['POST'])
def update_password_from_dashboard(request):
    """Update password after OTP verification from dashboard"""
    empid = request.data.get("empid")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")
    
    if not all([empid, new_password, confirm_password]):
        return Response({"status": False, "message": "All fields are required"})
    
    if new_password != confirm_password:
        return Response({"status": False, "message": "Passwords do not match"})
    
    try:
        user = Login.objects.get(empid=empid)
        
        # Verify that OTP was verified
        if not user.otp:
            return Response({"status": False, "message": "OTP verification required. Please restart the password change process."})
        
        # Check OTP expiration again
        if not user.otp_created_at or timezone.now() > user.otp_created_at + timedelta(minutes=10):
            user.otp = None
            user.otp_created_at = None
            user.save()
            return Response({"status": False, "message": "Session expired. Please restart the password change process."})
        
        # Password validation
        if new_password == empid:
            return Response({"status": False, "message": "Password cannot be same as Employee ID"})
        
        if new_password.lower() == user.empname.lower():
            return Response({"status": False, "message": "Password cannot be same as your name"})
        
        if len(new_password) < 6:
            return Response({"status": False, "message": "Password must be at least 6 characters long"})
        
        # Update password and clear OTP
        user.password = new_password
        user.otp = None
        user.otp_created_at = None
        user.save()
        
        # Send confirmation email
        html_content = create_email_template(
            title="Password Changed Successfully ✅",
            user_name=user.empname,
            message=f"Your password has been successfully changed.<br><br>"
                   f"<b>Employee ID:</b> {user.empid}<br>"
                   f"<b>Role:</b> {user.get_role_display()}<br>"
                   f"<b>Department:</b> {user.department}<br>"
                   f"<b>Time:</b> {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}<br><br>"
                   f"For security reasons, if you didn't make this change, "
                   f"please contact the administrator immediately."
        )
        
        send_email_with_logo(
            subject="Password Changed Successfully - Gate Pass App",
            html_content=html_content,
            recipient_email=user.email,
            user_name=user.empname
        )
        
        return Response({
            "status": True,
            "message": "Password updated successfully. You can now login with your new password."
        })
        
    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})


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