import json, pandas as pd, http.client, requests
from datetime import date, datetime, timezone, timedelta

import google.oauth2.service_account
from google.oauth2.service_account import Credentials
import googleapiclient.discovery
import re

from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.decorators import method_decorator
from django.db import connection
from django.db.models import Count, Min, Max, Q, F, Case, When, Value, IntegerField, ExpressionWrapper, FloatField, DurationField
from django.db.models.functions import Abs, Extract, Coalesce, RowNumber
from django.db.models.expressions import Window

from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt #一部のviewでCSRF保護を無効にする（開発環境でだけ使う）
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator #メアド認証用のトークン生成用
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.mixins import LoginRequiredMixin

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.mail import send_mail

from django.contrib.auth import get_user_model

from rest_framework import generics, status, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt import views as jwt_views, exceptions as jwt_exceptions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.authtoken.models import Token

from rest_framework.views import APIView, status
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
from rest_framework.exceptions import ValidationError

from .models import Account, Team, Player, Match, Post, Watch, Goal, Standing
from .serializers import MyTokenObtainPairSerializer, AccountSerializer, AccountHeaderSerializer, AccountEditSerializer, AccountStatisticsSerializer, AccountEditTeamSerializer, TeamSerializer, TeamListSerializer, TeamSupporterSerializer, PlayerSerializer, MatchSerializer, MatchGoalSerializer, PostSerializer, MotmPlayerSerializer, MatchPlayerSerializer, MatchNationalPlayerSerializer, WatchSerializer, StandingSerializer

#モデルのインクリメントを初期化
def reset_sequence(model):
    table_name = model._meta.db_table
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), 1, false);")

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

class ObtainTokenPairWithColorView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access')
        if raw_token is None:
            return None
    
        try:
            validated_token = UntypedToken(raw_token)
        except (InvalidToken, TokenError) as e:
            raise exceptions.AuthenticationFailed('Invalid token') from e
    
        return self.get_user(validated_token), validated_token

#リロード時にクッキーからJWTを取得してユーザーデータを返す
@api_view(['GET'])
@permission_classes([AllowAny])
def user_auth_restore(request):
    try:
        raw_token = request.COOKIES.get('access')
        if raw_token is None:
            # 非会員にエラー表示はしたくないので401エラーは返さずにメッセージにする
            return Response({'message': 'No token found in the cookies'}, status=status.HTTP_200_OK)
        
        validated_token = UntypedToken(raw_token)

        user_id = validated_token['user_id']
        user = Account.objects.get(id=user_id)
        serialized_user = AccountHeaderSerializer(user)

        return Response(serialized_user.data, status=status.HTTP_200_OK)
    except TokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    except:
        return Response({'error': 'Unexpected error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# リフレッシュトークンを取得
def get_refresh(request):
    try:
        refresh_token = request.COOKIES["refresh"]
        return JsonResponse({"refresh": refresh_token}, safe=False)
    except Exception as e:
        return JsonResponse({"error": "Unable to fetch refresh token"}, status=400)

# 新しいトークンリフレッシュビュー
class CustomTokenRefresh(jwt_views.TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except jwt_exceptions.TokenError as e:
            raise jwt_exceptions.InvalidToken(e.args[0])

        response_obj = Response(serializer.validated_data, status=status.HTTP_200_OK)
        response_obj.set_cookie(key="access", value=serializer.validated_data["access"], httponly=True, samesite='Strict')

        return response_obj

#ログアウト
def api_logout(request):
    response = HttpResponse("You're logged out.")
    response.delete_cookie('access')
    response.delete_cookie('refresh')
    return response

#Googleログイン
class GoogleLoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        auth_code = data.get('auth_code', None)
        if auth_code is not None:
            data = {
                'code': auth_code,
                'client_id': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_CLIENTID,
                'client_secret': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
                'redirect_uri': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
                'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
                'grant_type': 'authorization_code',
            }
            response = requests.post('https://oauth2.googleapis.com/token', data=data)
            token_data = response.json()

            headers = {'Authorization': 'Bearer ' + token_data['access_token']}
            response = requests.get('https://www.googleapis.com/oauth2/v1/userinfo', headers=headers)
            user_data = response.json()
            User = get_user_model()
            email = user_data['email']
            action = ''

            try:
                user = User.objects.select_related('support_team').get(email=email)  
                action = 'login' 
            except User.DoesNotExist:
                username = user_data['name'][:20]
                user = User.objects.create_user(name=username, email=email)
                user.is_active = True
                user.save()
                action = 'register'

            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            response_data = {
                "status": "success",
                "action": action,
                "message": "ログインに成功しました！",
                "current_user": {
                    "id": user.id,
                    "name": user.name,
                    "profile_image": user.profile_image.url,
                },
                "refresh": str(refresh),
                "access": str(access),
            }

            if user.support_team:  # support_teamが存在する場合のみ
                response_data["current_user"].update({
                    "support_team": user.support_team.id,
                    "support_team_competition": user.support_team.competition_id,
                    "support_team_season": user.support_team.season_id,
                })
            
            response = Response(response_data, status=status.HTTP_200_OK)
            response.set_cookie(key='refresh', value=str(refresh), httponly=True, samesite='Strict')
            response.set_cookie(key='access', value=str(access), httponly=True, samesite='Strict')

            return response
        else:
            return Response({'status': 'failed', 'error': 'No auth_code provided'}, status=status.HTTP_400_BAD_REQUEST)

class FeaturedMatches(APIView):

    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):

        if request.user.is_authenticated:
            current_account = Account.objects.select_related('support_team').get(pk=request.user.id)
        else:
            current_account = None

        all_matches_past = Match.objects.select_related('home_team', 'away_team').filter(started_at__lte=timezone.now()).order_by('-started_at')

        featured_matches = []

        if current_account and current_account.support_team:
            # ユーザーがサポートチームを持っている場合、その最新の試合を取得
            user_team_match = all_matches_past.filter(Q(home_team=current_account.support_team) | Q(away_team=current_account.support_team)).first()

            # サポートチームの試合を除外
            matches_without_support_team = all_matches_past.exclude(Q(home_team=current_account.support_team) | Q(away_team=current_account.support_team))
            recent_matches_past = list(matches_without_support_team)[:10]
            
            # ポスト数が多い順に3試合を取得
            top_matches = sorted(recent_matches_past, key=lambda match: (match.total_post_count, match.started_at), reverse=True)[:3]
            
            if user_team_match:
                featured_matches.append(user_team_match)
                # 既に1つの試合がフィーチャードされている場合は、トップ3のうち2つのみを取得する
                featured_matches.extend(top_matches[:2])
            else:
                # user_team_matchが取得できない場合、上記のトップ3をフィーチャードする
                featured_matches.extend(top_matches)

        else:
            recent_matches_past = all_matches_past[:30]
            top_matches = sorted(recent_matches_past, key=lambda match: (match.total_post_count, match.started_at), reverse=True)[:3]
            featured_matches.extend(top_matches)

        if not featured_matches:
            all_matches_future = Match.objects.select_related('home_team', 'away_team').filter(started_at__gte=timezone.now()).order_by('started_at', 'home_team')
            upcoming_match = all_matches_future.first()
            if upcoming_match:
                featured_matches.append(upcoming_match)

        # ログイン情報取得&リターン
        response = {
            'featured_matches': MatchSerializer(featured_matches, many=True).data,
        }

        if current_account:
            response['user'] = AccountSerializer(current_account).data
            response['has_watched'] = Watch.objects.select_related('user').filter(user=current_account, match__in=featured_matches).exists()

        return Response(response)

class CommonPagination(PageNumberPagination):
    page_size = 20

class LargePagination(PageNumberPagination):
    page_size = 40

#ここからユーザーページ用ビュー

class UserBase(APIView):
    def get_account(self, pk):
        return get_object_or_404(Account.objects.select_related('support_team'), pk=pk)

class UserDetail(UserBase):
    permission_classes = [AllowAny]

    def get(self, request, pk, format=None):
        account = self.get_account(pk)

        supported_at = account.supported_at
        if supported_at:
            if timezone.is_naive(supported_at): 
                supported_at = timezone.make_aware(supported_at)

            support_duration = timezone.now() - supported_at
            support_years = support_duration.days // 365
            support_months = support_duration.days % 365 // 30

            response = {
                'account': AccountSerializer(account).data,
                'support_years': support_years,
                'support_months': support_months
            }
        else:
            response = {
                'account': AccountSerializer(account).data,
            }

        return Response(response)

class UserStatistics(UserBase, APIView):
    permission_classes = [AllowAny]
    serializer_class = AccountStatisticsSerializer
   
    def get_queryset(self):
        account_id = self.kwargs['pk']

        # 今月と前月の範囲を設定
        today = date.today()
        first_day_this_month = date(today.year, today.month, 1)
        if today.month == 1:
            first_day_last_month = date(today.year - 1, 12, 1)
        else:
            first_day_last_month = date(today.year, today.month - 1, 1)

        # 投稿数
        post_count_this_month = Post.objects.filter(user_id=account_id, created_at__gte=first_day_this_month).count()
        post_count_last_month = Post.objects.filter(user_id=account_id, created_at__lt=first_day_this_month, created_at__gte=first_day_last_month).count()

        # 今月の観戦数
        watched_matches_this_month = Watch.objects.filter(user_id=account_id, created_at__gte=first_day_this_month).values_list('match_id', flat=True)
        posted_matches_this_month = Post.objects.filter(user_id=account_id, created_at__gte=first_day_this_month).values_list('match_id', flat=True)
        unique_matches_this_month = set(watched_matches_this_month).union(posted_matches_this_month)
        match_count_this_month = len(unique_matches_this_month)

        # 前月の観戦数
        watched_matches_last_month = Watch.objects.filter(user_id=account_id, created_at__lt=first_day_this_month, created_at__gte=first_day_last_month).values_list('match_id', flat=True)
        posted_matches_last_month = Post.objects.filter(user_id=account_id, created_at__lt=first_day_this_month, created_at__gte=first_day_last_month).values_list('match_id', flat=True)
        unique_matches_last_month = set(watched_matches_last_month).union(posted_matches_last_month)
        match_count_last_month = len(unique_matches_last_month)

        # 現地観戦数
        stadium_count_this_month = Post.objects.filter(user_id=account_id, created_at__gte=first_day_this_month, is_stadium=True).count()
        stadium_count_last_month = Post.objects.filter(user_id=account_id, created_at__lt=first_day_this_month, created_at__gte=first_day_last_month, is_stadium=True).count()

        # 今月の選手投票数
        players_this_month = list(Post.objects.filter(user_id=account_id, created_at__gte=first_day_this_month).values('player__id', 'player__name_ja', 'player__team__badge_name').annotate(count=Count('player_id')).order_by('-count', 'player__name')[:5])
        while len(players_this_month) < 5:
            players_this_month.append({
                "player__id": None,
                "player__name_ja": None,
                "count": 0
            })

        # 前月の選手投票数
        players_last_month = list(Post.objects.filter(user_id=account_id, created_at__lt=first_day_this_month, created_at__gte=first_day_last_month).values('player__id', 'player__name_ja', 'player__team__badge_name').annotate(count=Count('player_id')).order_by('-count', 'player__name')[:5])
        while len(players_last_month) < 5:
            players_last_month.append({
                "player__id": None,
                "player__name_ja": None,
                "count": 0
            })

        statistics = {
            'post_count_this_month': post_count_this_month,
            'post_count_last_month': post_count_last_month,
            'match_count_this_month': match_count_this_month,
            'match_count_last_month': match_count_last_month,
            'stadium_count_this_month': stadium_count_this_month,
            'stadium_count_last_month': stadium_count_last_month,
            'top_players_this_month': players_this_month,
            'top_players_last_month': players_last_month
        }

        return statistics

    def get(self, request, *args, **kwargs):
        statistics = self.get_queryset()
        return Response(statistics)

class UserPost(UserBase, generics.ListAPIView):
    permission_classes = [AllowAny]

    serializer_class = PostSerializer
    pagination_class = CommonPagination

    def get_queryset(self):
        account_id = self.kwargs.get('pk')
        return Post.objects.select_related('user', 'user__support_team', 'match', 'match__home_team', 'match__away_team', 'player').filter(user_id=account_id).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserMotm(UserBase, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MotmPlayerSerializer
    pagination_class = CommonPagination
   
    def get_queryset(self):
        account_id = self.kwargs['pk']

        players = Player.objects.annotate(
            post_count=Count('player_posts', filter=Q(player_posts__user_id=account_id))
        ).select_related('team').filter(post_count__gt=0).order_by('-post_count', 'name_ja')

        return players

class UserWatch(UserBase, generics.ListAPIView):
    permission_classes = [AllowAny]

    serializer_class = WatchSerializer
    pagination_class = CommonPagination

    def get_queryset(self):
        account_id = self.kwargs.get('pk')
        return Watch.objects.select_related('user', 'match', 'match__home_team', 'match__away_team').filter(user_id=account_id).order_by('-match__started_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

#ユーザー編集
@api_view(['GET', 'PUT'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def user_edit(request, pk):

    try:
        account = Account.objects.select_related('support_team').get(pk=pk)
    except Account.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AccountEditSerializer(account)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = AccountEditSerializer(account, data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            if 'supported_at' in validated_data:
                if validated_data['supported_at'] == datetime(1800, 1, 1, tzinfo=timezone.utc):
                    validated_data['supported_at'] = None
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserEditTeamList(generics.ListAPIView):

    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    queryset = Team.objects.filter(is_national=False).order_by('name')
    serializer_class = AccountEditTeamSerializer
    pagination_class = None

#ここからMatchページ

class MatchList(generics.ListAPIView):
    permission_classes = [AllowAny]

    queryset = Match.objects.select_related('home_team', 'away_team').filter(started_at__lte=timezone.now()).order_by('-started_at')[:10]
    serializer_class = MatchSerializer

class MatchDetail(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, pk, format=None):
        match = get_object_or_404(Match.objects.select_related('home_team', 'away_team'), pk=pk)
        goals = (
            Goal.objects.select_related('player')
            .filter(is_valid=True, match_id=pk,
                    match__home_score__gte=F('home_score'), 
                    match__away_score__gte=F('away_score'))
            .annotate(
                total_time=F('minute') + Coalesce(F('additional_time'), 0),
                row_number=Window(
                    expression=RowNumber(),
                    order_by=F('created_at').desc(),
                    partition_by=[F('home_score'), F('away_score')]
                )
            )
            .filter(row_number=1)
            .order_by('total_time')
        )

        if request.user.is_authenticated:
            current_account = Account.objects.select_related('support_team').get(pk=request.user.id)
            has_watched = Watch.objects.filter(user=current_account, match=match).exists()
        else:
            current_account = None
            has_watched = None

        response = {
            'match': MatchSerializer(match).data,
            'current_account': AccountSerializer(current_account).data if current_account else None,
            'has_watched': has_watched,
            'goals': MatchGoalSerializer(goals, many=True).data
        }
        return Response(response)
    
class MatchMotm(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MotmPlayerSerializer
    pagination_class = CommonPagination
   
    def get_queryset(self):
        match_id = self.kwargs['pk']

        players = Player.objects.annotate(
            post_count=Count('player_posts', filter=Q(player_posts__match_id=match_id))
        ).select_related('team').filter(post_count__gt=0).order_by('-post_count', 'name_ja')

        return players

class MatchPost(generics.ListAPIView):
    permission_classes = [AllowAny]

    serializer_class = PostSerializer
    pagination_class = CommonPagination

    def get_queryset(self):
        match_id = self.kwargs['pk']
        return Post.objects.select_related('user', 'user__support_team', 'player', 'match', 'match__home_team', 'match__away_team').filter(match=match_id).order_by('-created_at')

class MatchPostPlayerList(generics.ListAPIView):

    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    
    def get_players(self, team_id, is_national, position_order):
        if is_national:
            return Player.objects.filter(national_team_id=team_id, is_national=True).annotate(sort_order=position_order).order_by('sort_order', 'national_shirt_number', 'name')
        else:
            return Player.objects.filter(team_id=team_id, is_active=True).exclude(shirt_number=None).annotate(sort_order=position_order).order_by('sort_order', 'shirt_number', 'name')
        
    def get(self, request, pk, format=None):

        match = get_object_or_404(Match.objects.select_related('home_team', 'away_team'), pk=pk)

        position_order = Case(
            When(position='Goalkeeper', then=Value(1)),
            When(position='Defence', then=Value(2)),
            When(position='Midfield', then=Value(3)),
            When(position='Offence', then=Value(4)),
            default=Value(9999),
            output_field=IntegerField()
        )

        home_team_players = self.get_players(match.home_team_id, match.is_national, position_order)
        away_team_players = self.get_players(match.away_team_id, match.is_national, position_order)

        if match.is_national:
            home_team_serializer = MatchNationalPlayerSerializer(home_team_players, many=True, context={'is_national': True})
            away_team_serializer = MatchNationalPlayerSerializer(away_team_players, many=True, context={'is_national': True})
        else:
            home_team_serializer = MatchPlayerSerializer(home_team_players, many=True)
            away_team_serializer = MatchPlayerSerializer(away_team_players, many=True)

        response = {
            'home_team_players': home_team_serializer.data,
            'away_team_players': away_team_serializer.data,
        }
        return Response(response)

class MatchPostCreateView(APIView):

    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_match(self, *args, **kwargs):
        match_id = kwargs.get('id')
        match = get_object_or_404(Match, id=match_id)
        return match

    def create_object(self, match, user_id, player_id, content, is_highlight, is_stadium):
        # player_idが空文字列の場合、Noneに変換する
        player_id = None if player_id == "" else player_id

        if player_id is None and content is None:
            raise ValueError('マンオブザマッチとレビューのどちらかは入力必須です')

        user = Account.objects.get(pk=user_id)
        player = None if player_id is None else Player.objects.get(id=player_id)
        
        Post.objects.create(
            match=match,
            user=user,
            player=player,
            content=content,
            is_highlight = is_highlight,
            is_stadium = is_stadium,
        )

    def post(self, request, pk, *args, **kwargs):
        try:
            match = self.get_match(id=pk)
            data = request.data
            self.create_object(match, data.get('user'), data.get('player_id'), data.get('content'), data.get('is_highlight'), data.get('is_stadium'))
            return Response({'message': '投稿が完了しました'}, status=status.HTTP_201_CREATED)
        except ValueError as e:
            error_message = str(e)
            return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error_message = str(e)
            return Response({'error': 'エラーが発生しました'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MatchWatchCreateView(APIView):

    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_match(self, pk):
        match = get_object_or_404(Match, id=pk)
        return match
    
    def post(self, request, pk, user_id, *args, **kwargs):

        user = Account.objects.get(id=user_id)
        match = self.get_match(pk)
        existing_watch = Watch.objects.filter(match=match, user=user).first()

        if existing_watch:
            return Response({'error': 'The watch already exists.'}, status=409)
        else:
            Watch.objects.create(
                match=match,
                user=user
            )
            return Response({'watch_status': 'added'}, status=200)
        
    def delete(self, request, pk, user_id, *args, **kwargs):

        user = Account.objects.get(id=user_id)
        match = self.get_match(pk)
        existing_watch = Watch.objects.filter(match=match, user=user).first()

        if not existing_watch:
            return Response({'error': 'The watch does not exist.'}, status=404)
        else:
            existing_watch.delete()
            return Response({'watch_status': 'removed'}, status=200)

class ScheduleList(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MatchSerializer

    def get_queryset(self):
        competition_id = self.kwargs.get('competition_id')
        season_year = self.kwargs.get('season_year')

        stage = self.request.query_params.get('stage', None)
        matchday = self.request.query_params.get('matchday', None)

        if stage and matchday:
            return Match.objects.filter(
                competition_id=competition_id,
                season_year=season_year,
                stage=stage,
                matchday=matchday
            ).select_related('home_team', 'away_team').order_by('group', 'home_team__name', 'started_at')

        elif matchday and not stage:
            return Match.objects.filter(
                competition_id=competition_id,
                season_year=season_year,
                matchday=matchday
            ).select_related('home_team', 'away_team').order_by('started_at', 'home_team__name')

        elif not matchday and stage:
            return Match.objects.filter(
                competition_id=competition_id,
                season_year=season_year,
                stage=stage
            ).select_related('home_team', 'away_team').order_by('matchday', 'started_at', 'home_team__name')

        else:
            closest_match = Match.objects.filter(competition_id=competition_id, season_year=season_year).annotate(
                time_difference=ExpressionWrapper(
                    (Extract('started_at', 'epoch') - Extract(timezone.now(), 'epoch')), output_field=FloatField()
                )
            ).annotate(
                abs_time_difference=Abs('time_difference')
            ).order_by('abs_time_difference').first()

            if not closest_match:
                return Match.objects.none()

            closest_stage = closest_match.stage
            closest_matchday = closest_match.matchday

            return Match.objects.filter(
                competition_id=competition_id, season_year=season_year, stage=closest_stage, matchday=closest_matchday
            ).select_related('home_team', 'away_team').order_by('group', 'started_at', 'home_team_id')

class NationalMatches(generics.ListAPIView):

    permission_classes = [AllowAny]
    serializer_class = MatchSerializer

    def get_queryset(self):

        # 現在から3日前の日付を取得
        three_days_ago = timezone.now() - timedelta(days=3)

        return Match.objects.select_related('home_team', 'away_team').filter(home_team=766,started_at__gte=three_days_ago).order_by('started_at')

#ここからチームページ用ビュー

class TeamList(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TeamListSerializer

    def get_queryset(self):
        competition_id = self.kwargs.get('competition_id')

        if str(competition_id) == 'others':
            return Team.objects.filter(competition_id__isnull=True, is_national=False).order_by('id')
        else:
            return Team.objects.filter(competition_id=competition_id).order_by('name')

class TeamBase(APIView):
    def get_team(self, pk):
        return get_object_or_404(Team.objects, pk=pk)

class TeamDetail(TeamBase):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        team = self.get_team(pk)

        response = {
            'team': TeamSerializer(team).data,
        }

        return Response(response)

class TeamSupporter(TeamBase, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TeamSupporterSerializer
    pagination_class = LargePagination

    def get_queryset(self):
        team_id = self.kwargs.get('pk')
        return Account.objects.filter(support_team=team_id).order_by('created_at')

class TeamPost(TeamBase, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostSerializer
    pagination_class = CommonPagination

    def get_queryset(self):
        team_id = self.kwargs.get('pk')
        return Post.objects.select_related('user', 'user__support_team', 'match', 'match__home_team', 'match__away_team', 'player').filter(Q(match__home_team=(team_id)) | Q(match__away_team=(team_id))).order_by('-created_at')

class TeamMotm(TeamBase, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MotmPlayerSerializer
    pagination_class = CommonPagination

    def get_queryset(self):
        team_id = self.kwargs['pk']
        players = Player.objects.annotate(
            post_count=Count('player_posts', filter=Q(team_id=team_id))
        ).select_related('team').filter(post_count__gt=0).order_by('-post_count', 'name_ja')
        return players

#ここからPOST

class PostList(generics.ListAPIView):

    permission_classes = [AllowAny]

    serializer_class = PostSerializer
    pagination_class = CommonPagination

    def get_queryset(self):
        return Post.objects.select_related('user', 'user__support_team', 'player', 'match', 'match__home_team', 'match__away_team').order_by('-created_at')

class PostDetail(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.select_related('user', 'user__support_team', 'player', 'match', 'match__home_team', 'match__away_team')

#ここからStanding

class StandingList(APIView):
    permission_classes = [AllowAny]
    serializer_class = StandingSerializer

    def get(self, request, *args, **kwargs):
        competition_id = kwargs.get('competition_id')
        standings = list(Standing.objects.select_related('team').filter(competition_id=competition_id).order_by('group', 'position', 'team__name'))
        team_ids = [standing.team_id for standing in standings]

        one_day_ago = timezone.now() - timedelta(days=1)
        
        # 全ての未来の試合を取得
        future_matches = Match.objects.filter(
            Q(home_team_id__in=team_ids) | Q(away_team_id__in=team_ids),
            started_at__gte=one_day_ago,
            competition_id=competition_id
        ).exclude(
            status='FINISHED'
        ).order_by('started_at')

        # 各チームの最も近い未来の試合を取得
        next_opponents = {}
        for team_id in team_ids:
            for match in future_matches:
                if match.home_team_id == team_id:
                    next_opponents[team_id] = match.away_team_id
                    break
                elif match.away_team_id == team_id:
                    next_opponents[team_id] = match.home_team_id
                    break

        next_opponent_teams = Team.objects.in_bulk(list(next_opponents.values()))

        for standing in standings:
            standing.next_opponent_team = next_opponent_teams.get(next_opponents.get(standing.team_id))

        response = {
            'standings': self.serializer_class(standings, many=True).data
        }
        return Response(response)

# ▼ ここからTeamsのAPIデータ取得 ▼

def fetch_teams_data(competition_code):
    url = f"{settings.FOOTBALLDATA_API_URL}/v4/competitions/{competition_code}/teams"
    headers = {'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN}
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    response_data = response.json()

    competition_id = response_data['competition']['id']
    season_id = response_data['season']['id']

    def extract_team_data(team):
        return {
            'id': team['id'],
            'area_id': team['area']['id'],
            'competition_id': competition_id,
            'season_id': season_id,
            'name': team['name'],
            'short_name': team['shortName'],
            'tla': team['tla'],
            'crest_image_url': team['crest'],
            'founded_year': team['founded'] if 'founded' in team else None,
            'venue': team['venue'],
            'coach_id': team['coach']['id'] if 'coach' in team else None,
            'coach_name': team['coach']['name'] if 'coach' in team else None,
            'api_updated_at': team['lastUpdated']
        }

    teams_data = [extract_team_data(team) for team in response_data['teams']]
    existing_team_ids = [team_data['id'] for team_data in teams_data]
    existing_teams = {team.id: team for team in Team.objects.filter(id__in=existing_team_ids)}

    updated_teams = []
    new_teams = []

    for team_data in teams_data:
        team = existing_teams.get(team_data['id'])
        if team:
            for key, value in team_data.items():
                setattr(team, key, value)
            updated_teams.append(team)
        else:
            new_teams.append(Team(**team_data))

    # Team.objects.bulk_update(updated_teams, [
    #    'area_id', 'competition_id', 'season_id', 'name', 'short_name', 'tla',
    #    'crest_image_url', 'founded_year', 'venue', 'coach_id',
    #    'coach_name', 'api_updated_at'
    #])

    Team.objects.bulk_create(new_teams)

def fetch_teams_from_competitions():
    competitions = ['PL', 'PD', 'SA']
    for competition in competitions:
        fetch_teams_data(competition)

# ▼ ここからPlayersのAPIデータ取得 ▼

def fetch_players_data(competition_code):
    url = f"{settings.FOOTBALLDATA_API_URL}/v4/competitions/{competition_code}/teams"
    headers = { 'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    response_data = response.json()

    competition_id = response_data['competition']['id']
    season_id = response_data['season']['id']

    players_data = [
        {
            'id': player['id'],
            'team_id': team['id'],
            'competition_id': competition_id,
            'season_id': season_id,
            'name': player['name'],
            'position': player['position'],
            'birthday': player['dateOfBirth'],
            'nationality': player['nationality'],
            'shirt_number': player['shirtNumber'],
            'api_updated_at': team['lastUpdated']
        }
        for team in response_data['teams']
        for player in team['squad']
    ]

    # 重複チェック
    seen = set()
    duplicates = [player['id'] for player in players_data if player['id'] in seen or seen.add(player['id'])]
    if duplicates:
        print(f"Duplicated Player IDs: {duplicates}")

    # 取得したデータの中での重複の除去
    players_data = {player['id']: player for player in players_data}.values()

    player_ids = [player['id'] for player in players_data]
    existing_player_ids = Player.objects.filter(id__in=player_ids).values_list('id', flat=True)

    new_players_data = [player for player in players_data if player['id'] not in existing_player_ids]
    update_players_data = [player for player in players_data if player['id'] in existing_player_ids]

    new_player_objects = [
        Player(**player) for player in new_players_data if player['shirt_number'] is not None
    ]

    update_player_objects = [
        Player(**player) for player in update_players_data if player['shirt_number'] is not None
    ]

    Player.objects.bulk_create(new_player_objects)
    # Player.objects.bulk_update(update_player_objects, ['team_id', 'competition_id', 'season_id', 'name', 'nationality', 'position', 'birthday', 'shirt_number', 'api_updated_at'])

def fetch_players_from_competitions():
    competitions = ['PL', 'PD', 'SA', 'JJL']
    for competition in competitions:
        fetch_players_data(competition)

# ▼ ここからMatchesのAPIデータ取得 ▼

def fetch_matches_data(competition_code):
    url = f"{settings.FOOTBALLDATA_API_URL}/v4/competitions/{competition_code}/matches"
    headers = {'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()

    competition_id = data['competition']['id']
    season_id = data['matches'][0]['season']['id']
    season_year = data['filters']['season']

    def extract_match_data(row, competition_id, season_id, season_year):
        return {
            'id': row['id'],
            'competition_id': competition_id,
            'season_id': season_id,
            'season_year': season_year,
            'matchday': row['matchday'],
            'stage': row['stage'],
            'group': row['group'],
            'home_team_id': row['homeTeam']['id'],
            'away_team_id': row['awayTeam']['id'],
            'started_at': row['utcDate'],
            'status': row['status'],
            'winner': row['score'].get('winner'),
            'home_score': row['score']['fullTime'].get('home'),
            'away_score': row['score']['fullTime'].get('away'),
            'referees_id': row['referees'][0]['id'] if row['referees'] else None,
            'referees_name': row['referees'][0]['name'] if row['referees'] else None,
            'last_updated_at': row['lastUpdated'],
        }

    #全期間の既存データを取得
    #matches_data = [extract_match_data(match, competition_id, season_id, season_year) for match in data['matches']]

    #1日前以降の既存データを取得
    matches_data = [extract_match_data(match, competition_id, season_id, season_year) for match in data['matches'] if match['utcDate'] > (datetime.now() - timedelta(days=1)).isoformat()]


    existing_match_ids = {match.id for match in Match.objects.filter(id__in=[m['id'] for m in matches_data])}

    matches_to_create = [Match(**match_data) for match_data in matches_data if match_data['id'] not in existing_match_ids]
    matches_to_update = [Match(**match_data) for match_data in matches_data if match_data['id'] in existing_match_ids]

    Match.objects.bulk_create(matches_to_create)
    Match.objects.bulk_update(matches_to_update, ['competition_id', 'season_id', 'season_year', 'matchday', 'stage', 'group', 'home_team_id', 'away_team_id', 'started_at', 'status', 'winner', 'home_score', 'away_score', 'referees_id', 'referees_name', 'last_updated_at'])

def fetch_matches_from_competitions():
    competitions = ['PL', 'PD', 'SA', 'JJL', 'CL']
    for competition in competitions:
        fetch_matches_data(competition)

# ▼ ここからGoalsのAPIデータ取得 ▼

def fetch_goals_data(match_id):
    url = f"{settings.FOOTBALLDATA_API_URL}/v4/matches/{match_id}"
    headers = {'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()

    def extract_goals_data(row):
        goals = []

        # 頻繁に使用する要素を変数として保存
        competition_id = row['competition']['id']
        season_id = row['season']['id']
        match_id = row['id']

        for goal in row.get('goals', []):
            goal_data = {
                'competition_id': competition_id,
                'season_id': season_id,
                'match_id': match_id,
                'team_id': goal['team']['id'],
                'player_id': goal['scorer']['id'],
                'assist_player_id': goal['assist']['id'] if goal['assist'] else None,
                'minute': goal['minute'],
                'additional_time': goal.get('injuryTime', None),
                'type': goal['type'],
                'home_score': goal['score']['home'],
                'away_score': goal['score']['away'],
            }
            goals.append(goal_data)
        return goals

    goals_data = extract_goals_data(data)

    unique_keys = [(goal['match_id'], goal['home_score'], goal['away_score']) for goal in goals_data]
    existing_goals = Goal.objects.filter(match_id=match_id, home_score__in=[key[1] for key in unique_keys], away_score__in=[key[2] for key in unique_keys])
    existing_goals_dict = {(goal.match_id, goal.home_score, goal.away_score): goal for goal in existing_goals}

    goals_to_update = []
    goals_to_create = []

    for goal_data in goals_data:
        unique_key = (goal_data['match_id'], goal_data['home_score'], goal_data['away_score'])
        existing_goal = existing_goals_dict.get(unique_key)

        if existing_goal:
            for key, value in goal_data.items():
                setattr(existing_goal, key, value)
            # 既存のデータを更新用のdictにセット（既存のデータを上書き）
            goals_to_update.append(existing_goal)
        else:
            goals_to_create.append(Goal(**goal_data))

    Goal.objects.bulk_update(goals_to_update, ['competition_id', 'season_id', 'match_id', 'team_id', 'player_id', 'assist_player_id', 'additional_time', 'type', 'home_score', 'away_score'])
    Goal.objects.bulk_create(goals_to_create)

def fetch_recent_match_goals():
    # 3時間以内のmatch_idを取得
    current_time = timezone.now()
    three_hours_ago = timezone.now() - timedelta(hours=3)

    recent_match_ids = Match.objects.filter(started_at__gte=three_hours_ago, started_at__lte=current_time).values_list('id', flat=True)

    # 各match_idに対してfetch_goals_dataを実行
    for match_id in recent_match_ids:
        fetch_goals_data(match_id)

def fetch_standings_data(competition_code):
    url = f"{settings.FOOTBALLDATA_API_URL}/v4/competitions/{competition_code}/standings"
    headers = {'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN}
    response = requests.get(url, headers=headers)
    data = response.json()

    def extract_standings_data():
        standings = []

        # 頻繁に使用する要素を変数として保存
        competition_id = data['competition']['id']
        season_id = data['season']['id']
        season_year = data['filters']['season']

        for standing in data['standings']:
            stage = standing['stage']
            type_ = standing['type']
            group = standing.get('group')

            for table in standing['table']:
                standing_data = {
                    'competition_id': competition_id,
                    'season_id': season_id,
                    'season_year': season_year,
                    'stage': stage,
                    'type': type_,
                    'group': group,
                    'position': table['position'],
                    'team_id': table['team']['id'],
                    'played_matches': table['playedGames'],
                    'points': table['points'],
                    'won': table['won'],
                    'draw': table['draw'],
                    'lost': table['lost'],
                    'goals_for': table['goalsFor'],
                    'goals_against': table['goalsAgainst'],
                    'goal_difference': table['goalDifference'],
                    'form': table.get('form'),
                }
                standings.append(standing_data)
        return standings

    standings_data = extract_standings_data()

    # standings_dataからのteam_idを取得して、クエリするときに辞書として使用
    team_ids = {standing['team_id'] for standing in standings_data}
    teams = Team.objects.filter(id__in=team_ids)
    team_lookup = {team.id: team for team in teams}

    # 既存の standings を一度のクエリで取得
    existing_standings = Standing.objects.filter(
        competition_id=data['competition']['id'],
        season_id=data['season']['id']
    )

    existing_standings_lookup = {}
    for standing in existing_standings:
        if standing.stage == "GROUP_STAGE":
            key = (standing.competition_id, standing.season_id, standing.stage, standing.group, standing.team_id)
        else:
            key = (standing.competition_id, standing.season_id, standing.stage, standing.team_id)
            if standing.group:
                key += (standing.group,)
        existing_standings_lookup[key] = standing

    standings_to_update = []
    standings_to_create = []

    for standing_data in standings_data:
        if standing_data['stage'] == "GROUP_STAGE":
            key = (standing_data['competition_id'], standing_data['season_id'], standing_data['stage'], standing_data['group'], standing_data['team_id'])
        else:
            key = (standing_data['competition_id'], standing_data['season_id'], standing_data['stage'], standing_data['team_id'])
            if standing_data.get('group'):
                key += (standing_data['group'],)

        existing_standing = existing_standings_lookup.get(key)

        if existing_standing:
            for k, value in standing_data.items():
                setattr(existing_standing, k, value)
            standings_to_update.append(existing_standing)
        else:
            standings_to_create.append(Standing(**standing_data))
            
    Standing.objects.bulk_update(standings_to_update, ['competition_id', 'season_id', 'stage', 'type', 'group', 'position', 'team_id', 'played_matches', 'points', 'won', 'draw', 'lost', 'goals_for', 'goals_against', 'goal_difference', 'form'])
    Standing.objects.bulk_create(standings_to_create)

def fetch_standings_from_competitions():
    competitions = ['PL', 'PD', 'SA', 'JJL', 'CL']
    for competition in competitions:
        fetch_standings_data(competition)

def fetch_youtube_videos():
    SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

    credentials = google.oauth2.service_account.Credentials.from_service_account_info(settings.SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    youtube = googleapiclient.discovery.build('youtube', 'v3', credentials=credentials)

    # competition_idとチャンネルIDのマッピング
    competition_channel_mapping = {
        2021: "UCJ-l-sMQFHogSy8KXRyMIRA",
        2119: "UCoFLB_Gw_AoxUuuzKjXrc_Q",
        2014: "UCoFLB_Gw_AoxUuuzKjXrc_Q",
        2019: "UCoFLB_Gw_AoxUuuzKjXrc_Q",
        2001: "UCJQj2lbG_3w8UrncJd7JZXw",
    }

    one_day_ago = timezone.now() - timedelta(days=3)

    matches = Match.objects.filter(status='FINISHED', started_at__gte=one_day_ago, highlight_video_url__isnull=True).select_related('home_team', 'away_team')

    for match in matches:
        home_team_name = match.home_team.short_name_ja
        away_team_name = match.away_team.short_name_ja

        end_date = timezone.now()
        start_date_str = one_day_ago.strftime("%Y-%m-%dT%H:%M:%SZ")

        # matchのcompetition_idに基づいてチャンネルIDを取得
        channel_id = competition_channel_mapping.get(match.competition_id)
        if not channel_id:
            continue
        
        request = youtube.search().list(
            part="snippet",
            channelId=channel_id,
            type="video",
            publishedAfter=start_date_str,
            maxResults=50,
            regionCode="JP",
        )
        response = request.execute()

        #print(response)

        video_found = False
        for item in response.get("items", []):
            title = item["snippet"]["title"]

            # 単語が存在するかどうかのみで検索
            if home_team_name in title and away_team_name in title and "ハイライト" in title:
                video_id = item["id"]["videoId"]
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                match.highlight_video_url = video_url
                match.save(update_fields=['highlight_video_url'])
                
                video_found = True
                print(f"Match: {home_team_name} vs {away_team_name}, Matching video URL: {video_url}")
                break

        if not video_found:
            print(f"Match: {home_team_name} vs {away_team_name}, No matching video found.")

''' メールログイン関連（廃止）

class LoginRegister(ObtainTokenPairWithColorView):

    def post(self, request, *args, **kwargs):
        action = request.data.get('action')
        if action == 'login':
            # フォーム入力のユーザーID・パスワード取得
            email = request.data.get('email')
            password = request.data.get('password')

            # Djangoの認証機能
            User = get_user_model()
            try:
                user = User.objects.get(email=email)  # メールアドレスからユーザーを取得
            except User.DoesNotExist:
                return Response({"message": "メールアドレスまたはパスワードが間違っています", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)
            
            # authenticateを用いてパスワードとメールアドレスが一致しているか確認
            user = authenticate(request, email=email, password=password)
            if user is None:
                return Response({"message": "メールアドレスまたはパスワードが間違っています", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)
            
            # JWTを生成
            response = super().post(request, *args, **kwargs)
            if response.status_code == status.HTTP_200_OK:
                # ログイン成功のときユーザー情報を返す
                serialized_user = AccountHeaderSerializer(user)
                response.data.update({"next": 'index', "current_user": serialized_user.data})

                # JWTをクッキーに保存
                response.set_cookie(key='refresh', value=response.data['refresh'], httponly=True, samesite='Strict')
                response.set_cookie(key='access', value=response.data['access'], httponly=True, samesite='Strict')

            return response

        elif action == 'register':
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
    
            # バリデーションチェック
            User = get_user_model()
            try:
                validate_email(email)  # DjangoのEmailValidatorを使ってメアドチェック
                User.objects.get(email=email)  # 既存メアドチェック
                return Response({"message": "このメールアドレスは既に登録されています", "status": "error"}, status=400)
            except User.DoesNotExist:
                pass  # メールアドレスが存在しなければパス
            except ValidationError:
                return Response({"message": "有効なメールアドレスを入力してください", "status": "error"}, status=400)
    

            # パスワードの長さをチェック
            if len(username) > 20:
                return Response({"message": "ユーザー名は20文字以内で設定してください", "status": "error"}, status=400)

            # パスワードの長さをチェック
            if len(password) < 10:
                return Response({"message": "パスワードは10文字以上で設定してください", "status": "error"}, status=400)

            # ユーザーの作成と保存
            user = User.objects.create_user(name=username, email=email, password=password)
            user.is_active = False
            user.save()

            # 認証メールの送信
            try:
                send_confirmation_mail(request, user)
            except Exception as e:
                return Response({"message": "確認メールの送信に失敗しました", "status": "error"}, status=500)
            
            return Response({"message": "仮登録が完了しました", "status": "success"}, status=200)

# メールアドレス認証用のトークン生成
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )

account_activation_token = AccountActivationTokenGenerator()

#認証メール送信
def send_confirmation_mail(request, user):
    token = account_activation_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    mail_subject = '【ポストマッチ】メールアドレスを認証してください'
    from_email = "info@post-match.com"
    message = f"ポストマッチへようこそ！\n" \
                f"下記のリンクをクリックしてメールアドレスを認証してください。\n" \
                f"http://localhost:3000/registration_activate/{uid}/{token}"

    send_mail(mail_subject, message, from_email, [user.email])

#アカウントのアクティベート
@api_view(['POST'])
@permission_classes([AllowAny])
def api_activate(request):
    permission_classes = [AllowAny]
    if request.method == 'POST':
        data = json.loads(request.body)
        uidb64 = data.get('uidb64')
        token = data.get('token')

        User = get_user_model()
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()

            # JWTを生成
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            response_data = {
                "status": "success", 
                "message": "認証が完了しました！",
                "current_user": {
                    "id": user.id,
                    "name": user.name,
                    "profile_image": user.profile_image.url
                },
                "refresh": str(refresh),
                "access": str(access),
            }

            response = JsonResponse(response_data)
            response.set_cookie(key='refresh', value=str(refresh), httponly=True, samesite='Strict')
            response.set_cookie(key='access', value=str(access), httponly=True, samesite='Strict')

            return response
        else:
            return JsonResponse({"status": "error", "message": "認証に失敗しました..."})

    return JsonResponse({"status": "error", "message": "無効なリクエストです"})


class ApiPasswordResetView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        User = get_user_model()
        try:
            user = User.objects.get(email=email)  # メールアドレスからユーザーを取得
        except User.DoesNotExist:
            return Response({"message": "このメールアドレスは登録されていません", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)

        self.send_password_reset_mail(request, user)
        return Response({"message": "再設定メールを送信しました"})

    def send_password_reset_mail(self, request, user):
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        mail_subject = '【ポストマッチ】パスワードを再設定してください'
        from_email = "info@post-match.com"
        message = f"パスワード再設定リクエストを受け付けました。\n" \
                    f"下記のリンクをクリックしてパスワードを再設定してください。\n" \
                    f"http://localhost:3000/password_reset_confirm/{uid}/{token}"

        send_mail(mail_subject, message, from_email, [user.email])

def api_password_reset_comfirm(request):

    permission_classes = [AllowAny]

    if request.method == 'POST':
        data = json.loads(request.body)
        uidb64 = data.get('uidb64')
        token = data.get('token')
        new_password = data.get('new_password')
        re_new_password = data.get('re_new_password')

        User = get_user_model()
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            user = None

        if user is not None and password_reset_token.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return JsonResponse({"status": "success", "message": "パスワード再設定が完了しました"})
        else:
            return JsonResponse({"status": "error", "message": "再設定用リンクが無効です"})

    return JsonResponse({"status": "error", "message": "無効なリクエストです"})

#パスワード再設定用のトークン
class PasswordResetTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.password)
        )

password_reset_token = PasswordResetTokenGenerator()

'''