from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.models import Profile
from apps.accounts.serializers import (
    CustomTokenObtainPairSerializer,
    LoginResponseSerializer,
    LogoutSerializer,
    ProfileSerializer,
    RegisterResponseSerializer,
    RegisterSerializer,
    UserSerializer,
)
from config.schema import LOGIN_EXAMPLE, REGISTER_EXAMPLE


class AuthThrottleMixin:
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


@extend_schema(
    tags=["Auth"],
    summary="Register a new account",
    description="Create a recruiter or job seeker account. Returns user profile and JWT tokens.",
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
    description="Authenticate with email and password. Returns JWT access/refresh tokens and user data.",
    responses={200: LoginResponseSerializer},
    examples=[LOGIN_EXAMPLE],
    auth=[],
)
class LoginView(AuthThrottleMixin, TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(
    tags=["Auth"],
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new access token.",
    request=TokenRefreshSerializer,
    auth=[],
)
class RefreshTokenView(AuthThrottleMixin, TokenRefreshView):
    permission_classes = [AllowAny]


@extend_schema(
    tags=["Auth"],
    summary="Logout",
    description="Blacklist the refresh token. Requires a valid access token in the Authorization header.",
    request=LogoutSerializer,
    responses={200: None},
)
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


@extend_schema_view(
    get=extend_schema(
        tags=["Profiles"],
        summary="Get my profile",
        responses={200: ProfileSerializer},
    ),
    patch=extend_schema(
        tags=["Profiles"],
        summary="Update my profile",
        request=ProfileSerializer,
        responses={200: ProfileSerializer},
    ),
    put=extend_schema(
        tags=["Profiles"],
        summary="Replace my profile",
        request=ProfileSerializer,
        responses={200: ProfileSerializer},
    ),
)
class ProfileMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self) -> Profile:
        return self.request.user.profile


@extend_schema(
    tags=["Auth"],
    summary="Get current user",
    description="Return the authenticated user's account and profile.",
    responses={200: UserSerializer},
)
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
