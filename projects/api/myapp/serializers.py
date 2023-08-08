from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Account, Team, Match, Post, Watch, Player

#トークン発行
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        return token

class TeamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name_ja', 'tla', 'crest_image', 'total_supporter_count', 'club_color_code_first']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'tla', 'founded_year', 'name_ja', 'crest_image', 'crest_badge_image', 'total_supporter_count', 'club_color_code_first', 'club_color_code_second', 'coach_name_ja', 'venue_ja']

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
    class Meta:
        model = Account
        fields = ['id', 'support_team', 'profile_image']     

class AccountEditTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name_ja']

class AccountEditSerializer(serializers.ModelSerializer):
    support_team = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), allow_null=True)
    support_team_name_ja = serializers.SerializerMethodField()
    supported_at = serializers.DateTimeField(allow_null=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'profile_image', 'support_team', 'support_team_name_ja', 'supported_at', 'description', 'twitter_id']
        
    def get_support_team_name_ja(self, obj):
        if obj.support_team is not None:
            return obj.support_team.name_ja
        else:
            return None

#ポスト用

class PostTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name_ja', 'tla', 'crest_badge_image']

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
        fields = ['id', 'matchday', 'home_team', 'away_team', 'started_at', 'status', 'home_score', 'away_score', 'total_post_count']

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
        fields = ['id', 'name_ja', 'tla', 'crest_image']

class MatchSerializer(serializers.ModelSerializer):
    home_team = MatchTeamSerializer(read_only=True)
    away_team = MatchTeamSerializer(read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'matchday', 'home_team', 'away_team', 'started_at', 'status', 'home_score', 'away_score', 'total_watch_count', 'total_post_count']

class MatchPostPlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Player
        fields = ['id', 'name_ja']

class WatchSerializer(serializers.ModelSerializer):
    match = MatchSerializer()   

    class Meta:
        model = Watch
        fields = '__all__'

