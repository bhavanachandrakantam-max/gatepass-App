import random
from django.core.mail import EmailMultiAlternatives
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from email.mime.image import MIMEImage
from .models import Login
import os


@api_view(['POST'])
def login_view(request):
    empid = request.data.get('empid')
    password = request.data.get('password')

    if not empid or not password:
        return Response({"status": False, "message": "EmpID and Password required"})

    try:
        user = Login.objects.get(empid=empid)

        # ✅ FIRST TIME LOGIN
        if user.password == empid:
            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.save()

            subject = "Gate Pass OTP Verification"

            html_content = f"""
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
                    Gate Pass App
                  </h2>

                  <p>Hello <b>{user.empname}</b>,</p>

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

                  <p>If you did not request this, please ignore.</p>

                  <hr style="margin:30px 0;">

                  <p style="font-size:12px;color:gray;text-align:center;">
                    SVR Engineering College Gate Pass System
                  </p>

                </div>
              </body>
            </html>
            """

            msg = EmailMultiAlternatives(
                subject,
                "",
                settings.EMAIL_HOST_USER,
                [user.email],
            )

            msg.attach_alternative(html_content, "text/html")

            # ✅ ATTACH LOGO
            logo_path = os.path.join(settings.BASE_DIR, "app1/static/app1/svr_logo.png")
            with open(logo_path, "rb") as f:
                img = MIMEImage(f.read())
                img.add_header("Content-ID", "<logo>")
                img.add_header("Content-Disposition", "inline", filename="logo.png")
                msg.attach(img)

            msg.send()

            return Response({
                "status": "otp",
                "message": "OTP sent to your email",
                "empid": empid,
                "email": user.email
            })

        # ❌ WRONG PASSWORD
        if user.password != password:
            return Response({"status": False, "message": "Invalid password"})

        # ✅ NORMAL LOGIN
        return Response({
            "status": True,
            "role": user.role,
            "department": user.department
        })

    except Login.DoesNotExist:
        return Response({
            "status": False,
            "message": "Employee not found. Contact clerk."
        })


@api_view(['POST'])
def verify_otp(request):
    empid = request.data.get("empid")
    otp = request.data.get("otp")

    if not empid or not otp:
        return Response({"status": False, "message": "EmpID and OTP required"})

    try:
        user = Login.objects.get(empid=empid, otp=otp)
        return Response({"status": True})

    except Login.DoesNotExist:
        return Response({"status": False, "message": "Invalid OTP"})


@api_view(['POST'])
def change_password(request):
    empid = request.data.get("empid")
    new_password = request.data.get("password")

    if not empid or not new_password:
        return Response({"status": False, "message": "All fields required"})

    try:
        user = Login.objects.get(empid=empid)

        if new_password == empid:
            return Response({"status": False, "message": "Password cannot match EmpID"})

        user.password = new_password
        user.otp = None
        user.save()

        return Response({"status": True, "message": "Password changed successfully"})

    except Login.DoesNotExist:
        return Response({"status": False, "message": "User not found"})


@api_view(['POST'])
def forgot_password(request):
    empid = request.data.get("empid")

    if not empid:
        return Response({"status": False, "message": "EmpID required"})

    try:
        user = Login.objects.get(empid=empid)

        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()

        subject = "Gate Pass Password Reset OTP"

        html_content = f"""
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
                    Gate Pass App
                  </h2>

                  <p>Hello <b>{user.empname}</b>,</p>

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

                  <p>If you did not request this, please ignore.</p>

                  <hr style="margin:30px 0;">

                  <p style="font-size:12px;color:gray;text-align:center;">
                    SVR Engineering College Gate Pass System
                  </p>

                </div>
              </body>
            </html>
        """

        msg = EmailMultiAlternatives(
            subject,
            "",
            settings.EMAIL_HOST_USER,
            [user.email],
        )

        msg.attach_alternative(html_content, "text/html")

        logo_path = os.path.join(settings.BASE_DIR, "app1/static/app1/svr_logo.png")
        with open(logo_path, "rb") as f:
            img = MIMEImage(f.read())
            img.add_header("Content-ID", "<logo>")
            img.add_header("Content-Disposition", "inline", filename="logo.png")
            msg.attach(img)

        msg.send()

        return Response({
            "status": True,
            "empid": empid,
            "email": user.email
        })

    except Login.DoesNotExist:
        return Response({"status": False, "message": "Employee not found"})
