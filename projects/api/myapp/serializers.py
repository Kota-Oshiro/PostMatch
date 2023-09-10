from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Account, Team, Match, Post, Watch, Player, Goal

#トークン発行
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        return token

class TeamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'competition_id', 'name_ja', 'tla', 'total_supporter_count', 'club_color_code_first']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'competition_id', 'tla', 'founded_year', 'name_ja', 'total_supporter_count', 'club_color_code_first', 'coach_name_ja', 'venue_ja']

class TeamSupporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'profile_image']

class AccountSerializer(serializers.ModelSerializer):
    support_team = TeamSerializer(read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'created_at', 'is_active', 'profile_image', 'support_team', 'supported_at', 'description', 'twitter_id', 'total_watch_count', 'total_post_count']

class PlayerSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Player
        fields = ['id', 'name_ja', 'nationality', 'team']

class AccountHeaderSerializer(serializers.ModelSerializer):
    support_team_competition = serializers.SerializerMethodField()
    support_team_season = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'support_team', 'profile_image', 'support_team_competition', 'support_team_season']

    def get_support_team_competition(self, obj):
        if obj.support_team is not None:
            return obj.support_team.competition_id
        else:
            return None

    def get_support_team_season(self, obj):
        if obj.support_team is not None:
            return obj.support_team.season_id
        else:
            return None

class AccountEditTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['competition_id', 'season_id', 'id', 'name_ja', 'tla']

class AccountEditSerializer(serializers.ModelSerializer):
    support_team = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), allow_null=True)
    support_team_competition = serializers.SerializerMethodField()
    support_team_season = serializers.SerializerMethodField()
    support_team_name_ja = serializers.SerializerMethodField()
    support_team_tla = serializers.SerializerMethodField()
    supported_at = serializers.DateTimeField(allow_null=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'profile_image', 'support_team', 'support_team_competition', 'support_team_season', 'support_team_name_ja', 'support_team_tla', 'supported_at', 'description', 'twitter_id']

    def get_support_team_competition(self, obj):
        if obj.support_team is not None:
            return obj.support_team.competition_id
        else:
            return None

    def get_support_team_season(self, obj):
        if obj.support_team is not None:
            return obj.support_team.season_id
        else:
            return None

    def get_support_team_name_ja(self, obj):
        if obj.support_team is not None:
            return obj.support_team.name_ja
        else:
            return None

    def get_support_team_tla(self, obj):
        if obj.support_team is not None:
            return obj.support_team.tla
        else:
            return None

#ポスト用

class PostTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'competition_id', 'tla', 'name_ja', 'club_color_code_first']

class PostAccountSerializer(serializers.ModelSerializer):
    support_team = PostTeamSerializer(read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'profile_image', 'support_team', 'supported_at']

class PostMatchSerializer(serializers.ModelSerializer):
    home_team = PostTeamSerializer(read_only=True)
    away_team = PostTeamSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'competition_id', 'matchday', 'home_team', 'away_team', 'started_at', 'status', 'home_score', 'away_score', 'total_post_count']

class PostPlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Player
        fields = ['id', 'name_ja']

class PostSerializer(serializers.ModelSerializer):
    user = PostAccountSerializer()
    player = PostPlayerSerializer()
    match = PostMatchSerializer()

    class Meta:
        model = Post
        fields = '__all__'

#MOTM
class MotmTeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        fields = ['id', 'tla', 'crest_image', 'crest_badge_image']

class MotmPlayerSerializer(serializers.ModelSerializer):
    team = MotmTeamSerializer()
    post_count = serializers.IntegerField()

    class Meta:
        model = Player
        fields = ['id', 'name_ja', 'team', 'post_count']

#マッチページ

class MatchTeamSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Team
        fields = ['id', 'name_ja', 'tla', 'crest_image', 'club_color_code_first']

class MatchSerializer(serializers.ModelSerializer):
    home_team = MatchTeamSerializer(read_only=True)
    away_team = MatchTeamSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'competition_id', 'season_year', 'matchday', 'home_team', 'away_team', 'started_at', 'status', 'home_score', 'away_score', 'total_watch_count', 'total_post_count']

class MatchPlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Player
        fields = ['id', 'name_ja', 'shirt_number']

class MatchNationalPlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Player
        fields = ['id', 'name_ja', 'national_shirt_number']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['shirt_number'] = instance.national_shirt_number
        return data

class MatchGoalSerializer(serializers.ModelSerializer):
    player = MatchPlayerSerializer(read_only=True)
    assist_player = MatchPlayerSerializer(read_only=True)

    class Meta:
        model = Goal
        fields = [ 'team', 'player', 'assist_player', 'minute', 'additional_time', 'type']

class WatchSerializer(serializers.ModelSerializer):
    match = MatchSerializer()   

    class Meta:
        model = Watch
        fields = '__all__'

