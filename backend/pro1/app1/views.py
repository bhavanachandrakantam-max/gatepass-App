import random
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Login


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

            send_mail(
                subject="GatePass OTP",
                message=f"Your OTP is {otp}",
                from_email="noreply@svrec.ac.in",
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({
                "status": "otp",
                "message": "OTP sent to your email",
                "empid": empid
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
