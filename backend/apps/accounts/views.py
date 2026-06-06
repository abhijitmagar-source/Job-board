from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.cloudinary_utils import upload_file
from apps.accounts.models import CandidateProfile, RecruiterProfile, UserRole
from apps.accounts.permissions import IsAdmin, IsCandidate, IsRecruiter
from apps.accounts.serializers import (
    CandidateProfileSerializer,
    CustomTokenObtainPairSerializer,
    LoginResponseSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RecruiterProfileSerializer,
    RegisterResponseSerializer,
    RegisterSerializer,
    UserSerializer,
)
from apps.applications.models import Application
from apps.companies.models import Company
from apps.jobs.models import Job, SavedJob
from config.schema import LOGIN_EXAMPLE, REGISTER_EXAMPLE

User = get_user_model()


class AuthThrottleMixin:
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


@extend_schema(
    tags=["Auth"],
    summary="Register a new account",
    request=RegisterSerializer,
    responses={201: RegisterResponseSerializer},
    examples=[REGISTER_EXAMPLE],
    auth=[],
)
class RegisterView(AuthThrottleMixin, generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Auth"],
    summary="Login",
    responses={200: LoginResponseSerializer},
    examples=[LOGIN_EXAMPLE],
    auth=[],
)
class LoginView(AuthThrottleMixin, TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(tags=["Auth"], summary="Refresh access token", auth=[])
class RefreshTokenView(AuthThrottleMixin, TokenRefreshView):
    permission_classes = [AllowAny]


@extend_schema(tags=["Auth"], summary="Logout", request=LogoutSerializer)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Auth"],
    summary="Request password reset",
    request=PasswordResetRequestSerializer,
    auth=[],
)
class PasswordResetRequestView(AuthThrottleMixin, APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            from django.core.mail import send_mail

            reset_link = f"{request.data.get('reset_url', '')}?uid={uid}&token={token}"
            send_mail(
                subject="Password reset — Job Board",
                message=f"Use this link to reset your password: {reset_link}",
                from_email=None,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass
        return Response(
            {"detail": "If an account exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Auth"],
    summary="Confirm password reset",
    request=PasswordResetConfirmSerializer,
    auth=[],
)
class PasswordResetConfirmView(AuthThrottleMixin, APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token = serializer.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password has been reset."})


@extend_schema_view(
    get=extend_schema(tags=["Profiles"], summary="Get my profile"),
    patch=extend_schema(tags=["Profiles"], summary="Update my profile"),
    put=extend_schema(tags=["Profiles"], summary="Replace my profile"),
)
class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CandidateProfileSerializer

    def _get_profile_and_serializer(self, user):
        if user.is_recruiter:
            profile, _ = RecruiterProfile.objects.get_or_create(
                user=user, defaults={"name": user.email}
            )
            return profile, RecruiterProfileSerializer
        profile, _ = CandidateProfile.objects.get_or_create(
            user=user, defaults={"full_name": user.email}
        )
        return profile, CandidateProfileSerializer

    def get(self, request):
        profile, serializer_class = self._get_profile_and_serializer(request.user)
        return Response(serializer_class(profile).data)

    def patch(self, request):
        profile, serializer_class = self._get_profile_and_serializer(request.user)
        serializer = serializer_class(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request):
        return self.patch(request)


@extend_schema(tags=["Profiles"], summary="Upload resume (candidate)", request=None)
class UploadResumeView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = CandidateProfileSerializer

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            url = upload_file(file, "resumes")
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = CandidateProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.email}
        )
        profile.resume_url = url
        profile.save(update_fields=["resume_url", "updated_at"])
        return Response({"url": url, "resume_url": url})


@extend_schema(tags=["Profiles"], summary="Upload profile image (candidate)", request=None)
class UploadProfileImageView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = CandidateProfileSerializer

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            url = upload_file(file, "profile-images")
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = CandidateProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.email}
        )
        profile.profile_image_url = url
        profile.save(update_fields=["profile_image_url", "updated_at"])
        return Response({"url": url, "profile_image_url": url})


@extend_schema(tags=["Auth"], summary="Get current user")
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@extend_schema(tags=["Dashboard"], summary="Candidate dashboard stats", responses={200: dict})
class CandidateDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]
    serializer_class = UserSerializer

    def get(self, request):
        user = request.user
        applications = Application.objects.filter(applicant=user)
        return Response(
            {
                "applications_total": applications.count(),
                "applications_pending": applications.filter(status="pending").count(),
                "applications_shortlisted": applications.filter(status="shortlisted").count(),
                "saved_jobs_count": SavedJob.objects.filter(user=user).count(),
                "recent_applications": list(
                    applications.select_related("job", "job__company")
                    .order_by("-applied_at")[:5]
                    .values(
                        "id",
                        "status",
                        "applied_at",
                        "job__title",
                        "job__company__name",
                    )
                ),
            }
        )


@extend_schema(tags=["Dashboard"], summary="Recruiter dashboard stats", responses={200: dict})
class RecruiterDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]
    serializer_class = UserSerializer

    def get(self, request):
        user = request.user
        jobs = Job.objects.filter(posted_by=user)
        applications = Application.objects.filter(job__posted_by=user)
        return Response(
            {
                "jobs_total": jobs.count(),
                "jobs_active": jobs.filter(is_active=True).count(),
                "companies_count": Company.objects.filter(owner=user).count(),
                "applicants_total": applications.count(),
                "applicants_pending": applications.filter(status="pending").count(),
                "recent_applications": list(
                    applications.select_related("applicant", "job")
                    .order_by("-applied_at")[:5]
                    .values(
                        "id",
                        "status",
                        "applied_at",
                        "job__title",
                        "applicant__email",
                    )
                ),
            }
        )


@extend_schema(tags=["Dashboard"], summary="Admin dashboard stats", responses={200: dict})
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer

    def get(self, request):
        return Response(
            {
                "users_total": User.objects.count(),
                "candidates_count": User.objects.filter(role=UserRole.CANDIDATE).count(),
                "recruiters_count": User.objects.filter(role=UserRole.RECRUITER).count(),
                "companies_count": Company.objects.count(),
                "jobs_total": Job.objects.count(),
                "jobs_active": Job.objects.filter(is_active=True).count(),
                "applications_total": Application.objects.count(),
            }
        )
