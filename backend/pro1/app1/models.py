from django.db import models
from django.core.exceptions import ValidationError


def validate_svrec_email(value):
    if not value.endswith("@svrec.ac.in"):
        raise ValidationError("Only @svrec.ac.in email addresses are allowed.")


class Login(models.Model):
    ROLE_CHOICES = [
        ('faculty', 'Faculty'),
        ('hod', 'HOD'),
        ('admin', 'Admin'),
        ('security', 'Security'),
        ('principal','Principal'),
        ('office','Office'),
        ('clerk','Clerk'),
    ]

    empid = models.CharField(max_length=10, unique=True)
    empname = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True, validators=[validate_svrec_email])
    otp = models.CharField(max_length=6, blank=True, null=True)


    class Meta:
        db_table = "login"

    def __str__(self):
        return f"{self.empname} ({self.empid})"
