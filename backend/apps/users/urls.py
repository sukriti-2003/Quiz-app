from django.urls import path
from .views import GoogleLoginView, DemoLoginView, UserProfileView, LeaderboardView, AdminDashboardView

urlpatterns = [
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('demo/', DemoLoginView.as_view(), name='demo_login'),
    path('user/', UserProfileView.as_view(), name='user_profile'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('admin/stats/', AdminDashboardView.as_view(), name='admin_stats'),
]
