from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from . import views
from .views import ObtainTokenPairWithColorView, CustomTokenRefresh, GoogleLoginView, FeaturedMatches, NationalMatches, UserDetail, UserMotm, UserWatch, UserPost, UserEditTeamList, TeamList, TeamSupporter, TeamDetail, TeamPost, TeamMotm, MatchList, MatchDetail, MatchPost, MatchMotm, MatchPostPlayerList, MatchPostCreateView, MatchWatchCreateView, ScheduleList, PostList, PostDetail, StandingList

urlpatterns = [

    path('api/user_auth_restore/', views.user_auth_restore, name='user_auth_restore'),
    path('api/v1/auth/', include('djoser.urls.jwt')),
    path('api/get_refresh_token/', views.get_refresh),
    path('api/set_new_token/', CustomTokenRefresh.as_view()),
    path('api/logout/', views.api_logout, name='logout'),

   # googleLogin
    path('api/google_auth/', GoogleLoginView.as_view()),

    #メールログイン廃止
    #path('api/login_and_register/', LoginRegister.as_view(), name='login_register'),
    #path('api/activate/', views.api_activate, name='api_activate'),
    #path('api/password_reset/', ApiPasswordResetView.as_view(), name='password_reset'),
    #path('api/password_reset/confirm/', views.api_password_reset_comfirm, name='password_reset_confirm'),

    path('api/featured_matches/', FeaturedMatches.as_view()),
    path('api/national_matches/', NationalMatches.as_view()),

    path('api/user/<int:pk>/', UserDetail.as_view()),
    path('api/user/<int:pk>/motms/', UserMotm.as_view()),
    path('api/user/<int:pk>/watches/', UserWatch.as_view()),
    path('api/user/<int:pk>/posts/', UserPost.as_view()),
    path('api/user/<int:pk>/edit/', views.user_edit),
    path('api/user/edit/teams/', UserEditTeamList.as_view()),

    path('match/', MatchList.as_view(), name='match_list'),
    path('api/match/<int:pk>/', MatchDetail.as_view()),
    path('api/match/<int:pk>/posts/', MatchPost.as_view()),
    path('api/match/<int:pk>/motms/', MatchMotm.as_view()),
    path('api/match/<int:pk>/posts/players/', MatchPostPlayerList.as_view()),
    path('api/match/<int:pk>/post_create/', MatchPostCreateView.as_view()),
    path('api/match/<int:pk>/watch_create/<int:user_id>/', MatchWatchCreateView.as_view()),

    path('api/schedule/<int:competition_id>/<int:season_year>/', ScheduleList.as_view()),

    path('api/teams/<int:competition_id>/', TeamList.as_view()),
    path('api/teams/others/', TeamList.as_view(), {'competition_id': 'others'}),

    path('api/standing/<int:competition_id>/', StandingList.as_view()),

    path('api/team/<int:pk>/', TeamDetail.as_view()),
    path('api/team/<int:pk>/users/', TeamSupporter.as_view()),
    path('api/team/<int:pk>/posts/', TeamPost.as_view()),
    path('api/team/<int:pk>/motms/', TeamMotm.as_view()),

    path('api/posts/', PostList.as_view()),
    path('api/post/<int:pk>/', PostDetail.as_view()),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)