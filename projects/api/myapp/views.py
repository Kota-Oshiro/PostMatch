import json
import pandas as pd
import http.client

from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.decorators import method_decorator
from django.db.models import Count, Min, Q

from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt #一部のviewでCSRF保護を無効にする（開発環境でだけ使う）
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator #メアド認証用のトークン生成用
from rest_framework.authtoken.models import Token
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.mixins import LoginRequiredMixin

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.mail import send_mail

from django.contrib.auth import get_user_model

from rest_framework import generics, status, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from rest_framework.views import APIView, status
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
from rest_framework.exceptions import ValidationError

from .models import Account, Team, Player, Match, Post, Watch
from .serializers import MyTokenObtainPairSerializer, AccountSerializer, AccountHeaderSerializer, AccountEditSerializer, AccountEditTeamSerializer, TeamSerializer, TeamListSerializer, TeamSupporterSerializer, PlayerSerializer, MatchSerializer, PostSerializer, MotmPlayerSerializer, MatchPostPlayerSerializer, WatchSerializer



#googleログインのテスト

from django.http import JsonResponse
import requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import AccountHeaderSerializer

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
                user = User.objects.get(email=email)  
                action = 'login' 
            except User.DoesNotExist:
                username = user_data['name']
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
                "profile_image": user.profile_image.url
                },
                "refresh": str(refresh),
                "access": str(access),
            }

            response = Response(response_data, status=status.HTTP_200_OK)
            response.set_cookie(key='refresh', value=str(refresh), httponly=True, samesite='Strict')
            response.set_cookie(key='access', value=str(access), httponly=True, samesite='Strict')

            return response
        else:
            return Response({'status': 'failed', 'error': 'No auth_code provided'}, status=status.HTTP_400_BAD_REQUEST)

class Index(APIView):

    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):

        if request.user.is_authenticated:
            current_account = Account.objects.select_related('support_team').get(pk=request.user.id)
        else:
            current_account = None

        all_matches_past = Match.objects.select_related('home_team', 'away_team').filter(started_at__lte=timezone.now()).order_by('-started_at')
        recent_matches_past = all_matches_past[:10]

        if not recent_matches_past:
            all_matches_future = Match.objects.select_related('home_team', 'away_team').filter(started_at__gte=timezone.now()).order_by('started_at')
            recent_matches_future = all_matches_future[:10]
            matches = list(recent_matches_future)
        else:
            matches = list(reversed(recent_matches_past))

        if current_account and current_account.support_team is not None:
            # ユーザーがサポートチームを持っている場合、そのチームの過去直近の試合
            featured_match = all_matches_past.filter(Q(home_team=current_account.support_team) | Q(away_team=current_account.support_team)).first()

            if not featured_match:
                # ユーザーのサポートチームの最近の試合がnullの場合、最近の試合の中で最もPOSTが多い試合
                featured_match = max(matches, key=lambda match: match.total_post_count, default=None)
        else:
            # サポートチームがないユーザーまたは非ログインユーザーは最近の試合の中で最もPOSTが多い試合
            featured_match = max(matches, key=lambda match: match.total_post_count, default=None)

        if not featured_match:
            featured_match = Match.objects.select_related('home_team', 'away_team').filter(started_at__gte=timezone.now()).order_by('started_at').first()

        #ログイン情報取得&リターン
        if current_account:
            has_watched = Watch.objects.select_related('user').filter(user=current_account, match=featured_match).exists()
            
            response = {
                'user': AccountSerializer(current_account).data,
                'has_watched': has_watched,
                'featured_match': MatchSerializer(featured_match).data,
            }            
            return Response(response)
        else:
            response = {
                'featured_match': MatchSerializer(featured_match).data,
            }   
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
        ).select_related('team').filter(post_count__gt=0).order_by('-post_count', 'name')

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
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserEditTeamList(generics.ListAPIView):

    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    queryset = Team.objects.order_by('name')
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
        ).select_related('team').filter(post_count__gt=0).order_by('-post_count', 'name')

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
    
    def get(self, request, pk, format=None):

        match = get_object_or_404(Match.objects.select_related('home_team', 'away_team'), pk=pk)
        players = Player.objects.filter(team__in=[match.home_team, match.away_team])

        home_team_players = players.filter(team=match.home_team)
        away_team_players = players.filter(team=match.away_team)

        response = {
            'home_team_players': MatchPostPlayerSerializer(home_team_players, many=True).data,
            'away_team_players': MatchPostPlayerSerializer(away_team_players, many=True).data,
        }
        return Response(response)

class MatchPostCreateView(APIView):

    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_match(self, *args, **kwargs):
        match_id = kwargs.get('id')
        match = get_object_or_404(Match, id=match_id)
        return match

    def create_object(self, match, user_id, player_id, content):
        if match is None and player_id is None:
            raise ValueError('マンオブザマッチとレビューのどちらかは入力必須です')

        user = Account.objects.get(pk=user_id)
        player = Player.objects.get(id=player_id)
    
        Post.objects.create(
            match=match,
            user=user,
            player=player,
            content=content
        )

    def post(self, request, pk, *args, **kwargs):
        try:
            match = self.get_match(id=pk)
            data = request.data
            self.create_object(match, data.get('user'), data.get('player_id'), data.get('content'))
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
        season_id = self.kwargs.get('season_id')

        if season_id is None:
            raise ValidationError({"message": "Invalid parameters"})

        # 各matchdayごとの最小のstartedAtを計算
        matchday_startedAt_min = Match.objects.filter(season_id=season_id).values('matchday').annotate(min_startedAt=Min('started_at'))

        # 現在の時間と最も近いmatchdayを選択
        closest_matchday = min(matchday_startedAt_min, key=lambda x: abs(x['min_startedAt'] - timezone.now()))

        return Match.objects.filter(competition_id=competition_id, season_id=season_id, matchday=closest_matchday['matchday']).select_related('home_team', 'away_team').order_by('started_at', 'home_team_id')

class ScheduleMatchdayList(generics.ListAPIView):

    permission_classes = [AllowAny]
    serializer_class = MatchSerializer

    def get_queryset(self):
        competition_id = self.kwargs.get('competition_id')
        season_id = self.kwargs.get('season_id')
        matchday = self.kwargs.get('matchday')

        queryset = Match.objects.select_related('home_team', 'away_team') \
            .filter(season_id=season_id, matchday=matchday) \
            .order_by('started_at', 'home_team_id')

        return queryset

#ここからチームページ用ビュー

class TeamList(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TeamListSerializer

    def get_queryset(self):
        competition_id = self.kwargs['competition_id']
        season_id = self.kwargs['season_id']
        return Team.objects.filter(competition_id=competition_id, season_id=season_id).order_by('name')

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
        ).select_related('team').filter(post_count__gt=0).order_by('-post_count', 'name')
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

# ▼ ここからTeamsのAPIデータ取得 ▼

#既存team_idを取得して新規をbulk_createで作成、既存をbulk_updateで作成
def fetch_and_store_teams_data():
    connection = http.client.HTTPConnection(settings.FOOTBALLDATA_API_URL)
    headers = { 'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN }
    connection.request('GET', '/v4/competitions/PL/teams', None, headers)
    response = json.loads(connection.getresponse().read().decode())

    competition_id = response['competition']['id']
    season_id = response['season']['id']

    df_original = pd.DataFrame(response['teams'])

    get_teams_data = lambda row: {
        'id': row['id'],
        'area_id': row['area']['id'],
        'competition_id': competition_id,
        'season_id': season_id,
        'name': row['name'],
        'short_name': row['shortName'],
        'tla': row['tla'],
        'crest_image_url': row['crest'],
        'founded_year': row['founded'] if pd.notnull(row['founded']) else None,
        'venue': row['venue'],
        'coach_id': row['coach']['id'] if 'coach' in row else None,
        'coach_name': row['coach']['name'] if 'coach' in row else None,
        'last_updated_at': pd.to_datetime(row['lastUpdated'])
    }

    teams_data = [get_teams_data(row) for index, row in df_original.iterrows()]

    existing_team_ids = [team_data['id'] for team_data in teams_data]
    existing_teams = Team.objects.filter(id__in=existing_team_ids)

    updated_teams = []
    new_teams = []

    for team_data in teams_data:
        try:
            team = existing_teams.get(id=team_data['id'])
            for key, value in team_data.items():
                setattr(team, key, value)
            updated_teams.append(team)
        except Team.DoesNotExist:
            new_teams.append(Team(**team_data))

    Team.objects.bulk_update(updated_teams, [
        'area_id', 'competition_id', 'season_id', 'name', 'short_name', 'tla',
        'crest_image_url', 'founded_year', 'venue', 'coach_id',
        'coach_name', 'last_updated_at'
    ])
    Team.objects.bulk_create(new_teams)

# ▼ ここからPlayersのAPIデータ取得 ▼

#既存player_idを取得して新規をbulk_createで作成、既存をbulk_updateで作成
def fetch_and_store_players_data():
    connection = http.client.HTTPConnection(settings.FOOTBALLDATA_API_URL)
    headers = { 'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN }
    connection.request('GET', '/v4/competitions/PL/teams', None, headers)
    response = json.loads(connection.getresponse().read().decode())

    season_id = response['season']['id']

    df_original = pd.DataFrame(response['teams'])

    players_data = []
    for index, row in df_original.iterrows():
        team_id = row['id']
        for player in row['squad']:
            player_data = {
                'team_id': team_id,
                'id': player['id'],
                'name': player['name'],
                'position': player['position'],
                'birthday': player['dateOfBirth'],
                'nationality': player['nationality'],
                'last_updated_at': row['lastUpdated'],
                'season_id': season_id
            }
            players_data.append(player_data)

    df_players = pd.DataFrame(players_data)

    df_players['last_updated_at'] = pd.to_datetime(df_players['last_updated_at'])
    df_players['birthday'] = pd.to_datetime(df_players['birthday'])

    player_ids = df_players['id'].tolist()

    existing_player_ids = Player.objects.filter(id__in=player_ids).values_list('id', flat=True)

    new_player_data = df_players[~df_players['id'].isin(existing_player_ids)]
    update_player_data = df_players[df_players['id'].isin(existing_player_ids)]

    new_player_objects = []
    for index, row in new_player_data.iterrows():
        new_player_objects.append(
            Player(
                id=row['id'],
                season_id=row['season_id'],
                team_id=row['team_id'],
                name=row['name'],
                nationality=row['nationality'],
                position=row['position'], 
                birthday=row['birthday'],
                last_updated_at=row['last_updated_at']
            )
        )

    Player.objects.bulk_create(new_player_objects)

    update_player_objects = []
    for index, row in update_player_data.iterrows():
        update_player_objects.append(
            Player(
                id=row['id'],
                season_id=row['season_id'],
                team_id=row['team_id'],
                name=row['name'],
                nationality=row['nationality'],
                position=row['position'], 
                birthday=row['birthday'],
                last_updated_at=row['last_updated_at']
            )
        )

    Player.objects.bulk_update(update_player_objects, ['season_id', 'team_id', 'name', 'nationality', 'position', 'birthday', 'last_updated_at'])

# ▼ ここからMatchesのAPIデータ取得 ▼

def fetch_and_store_matches_data():
    connection = http.client.HTTPConnection(settings.FOOTBALLDATA_API_URL)
    headers = { 'X-Auth-Token': settings.FOOTBALLDATA_API_TOKEN }
    connection.request('GET', '/v4/competitions/PL/matches', None, headers)
    response = json.loads(connection.getresponse().read().decode())

    competition_id = response['competition']['id']   

    df_original = pd.DataFrame(response['matches'])

    get_matches_data = lambda row: pd.Series([
        row['season']['id'],
        row['id'],
        row['matchday'],
        row['homeTeam']['id'],
        row['awayTeam']['id'],
        row['utcDate'],
        row['status'],
        row['score'].get('winner', None),
        int(row['score']['fullTime'].get('home', 0)) if row['score']['fullTime'].get('home') is not None else None,
        int(row['score']['fullTime'].get('away', 0)) if row['score']['fullTime'].get('away') is not None else None,
        int(row['referees'][0]['id']) if row['referees'] else None,
        row['referees'][0]['name'] if row['referees'] else None,
        row['lastUpdated'],
        competition_id,
    ], index=['season_id', 'id', 'matchday', 'home_team_id', 'away_team_id', 'started_at', 'status', 'winner', 'home_score', 'away_score', 'referees_id', 'referees_name', 'last_updated_at', 'competition_id'])

    df_matches = df_original.apply(get_matches_data, axis=1)
    df_matches['started_at'] = pd.to_datetime(df_matches['started_at'])
    df_matches['last_updated_at'] = pd.to_datetime(df_matches['last_updated_at'])

    match_ids = df_matches['id'].tolist()
    existing_matches = Match.objects.filter(id__in=match_ids)
    existing_match_ids = [match.id for match in existing_matches]

    matches_to_create = []
    matches_to_update = []
    for index, row in df_matches.iterrows():
        if pd.isna(row['id']):
            continue
        match_data = {
            'id': row['id'],
            'competition_id': row['competition_id'],
            'season_id': row['season_id'],
            'matchday': row['matchday'],
            'home_team_id': row['home_team_id'], 
            'away_team_id': row['away_team_id'],
            'started_at': row['started_at'],
            'status': row['status'],
            'winner': row['winner'], 
            'home_score': row['home_score'] if pd.notna(row['home_score']) else None,
            'away_score': row['away_score'] if pd.notna(row['away_score']) else None,
            'referees_id': row['referees_id'] if pd.notna(row['referees_id']) else None,
            'referees_name': row['referees_name'] if pd.notna(row['referees_name']) else None,
            'last_updated_at': row['last_updated_at'],
        }
        if row['id'] in existing_match_ids:
            matches_to_update.append(Match(**match_data))
        else:
            matches_to_create.append(Match(**match_data))

    Match.objects.bulk_create(matches_to_create)
    Match.objects.bulk_update(matches_to_update, ['competition_id', 'season_id', 'matchday', 'home_team_id', 'away_team_id', 'started_at', 'status', 'winner', 'home_score', 'away_score', 'referees_id', 'referees_name', 'last_updated_at'])



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