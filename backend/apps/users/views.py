from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import GoogleLoginSerializer, UserSerializer
import requests as http_requests

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credential = serializer.validated_data['credential']

        try:
            # Try verifying as an ID token first
            try:
                idinfo = id_token.verify_oauth2_token(
                    credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
                )
                email = idinfo['email']
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
                avatar_url = idinfo.get('picture', '')
                google_id = idinfo['sub']
            except ValueError:
                # If ID token verification fails, treat as access token
                # Fetch user info from Google's userinfo API
                userinfo_res = http_requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {credential}'}
                )
                if userinfo_res.status_code != 200:
                    return Response(
                        {'error': 'Invalid Google token'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                userinfo = userinfo_res.json()
                email = userinfo['email']
                first_name = userinfo.get('given_name', '')
                last_name = userinfo.get('family_name', '')
                avatar_url = userinfo.get('picture', '')
                google_id = userinfo['sub']

            # Get or create user
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email.split('@')[0] + '_' + google_id[:5],
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
                'google_id': google_id
            })

            if not created:
                # Update profile info on login
                user.first_name = first_name
                user.last_name = last_name
                user.avatar_url = avatar_url
                user.save()

            # Generate JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': 'Invalid Google token', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DemoLoginView(APIView):
    """Demo login for development - creates a test user and returns JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.DEBUG:
            return Response(
                {'error': 'Demo login is only available in development mode.'},
                status=status.HTTP_403_FORBIDDEN
            )

        email = request.data.get('email', 'demo@quizportal.com')
        first_name = request.data.get('first_name', 'Demo')
        last_name = request.data.get('last_name', 'User')

        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email.split('@')[0],
            'first_name': first_name,
            'last_name': last_name,
            'avatar_url': '',
            'google_id': 'demo_' + email.split('@')[0],
        })

        if not created:
            # Update name if user already exists
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        users = User.objects.all().order_by('-total_score')[:50]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from apps.quizzes.models import Quiz
        from apps.attempts.models import Attempt
        from apps.quizzes.serializers import QuizSerializer

        total_users = User.objects.count()
        total_quizzes = Quiz.objects.count()
        total_attempts = Attempt.objects.count()

        # Get top 5 users
        top_users = User.objects.order_by('-total_score')[:5]
        top_users_data = UserSerializer(top_users, many=True).data

        # Get 5 most recent quizzes
        recent_quizzes = Quiz.objects.order_by('-created_at')[:5]
        recent_quizzes_data = QuizSerializer(recent_quizzes, many=True).data

        return Response({
            'total_users': total_users,
            'total_quizzes': total_quizzes,
            'total_attempts': total_attempts,
            'top_users': top_users_data,
            'recent_quizzes': recent_quizzes_data,
        })
