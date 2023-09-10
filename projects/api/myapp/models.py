from django.db import models
from django.db.models import F
from django.db.models.signals import pre_save
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.conf import settings
from django.dispatch import receiver

# チーム情報
class Team(models.Model):
    id = models.IntegerField(primary_key=True)
    area_id = models.IntegerField()
    competition_id = models.IntegerField()  
    season_id = models.IntegerField(null=True) 
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    tla = models.CharField(max_length=255)
    crest_image_url = models.URLField(null=True)
    coach_id = models.IntegerField(null=True)
    coach_name = models.CharField(max_length=255, null=True)
    founded_year = models.IntegerField(null=True)
    venue = models.CharField(max_length=255, null=True)
    api_updated_at = models.DateTimeField()
    name_ja = models.CharField(max_length=255, null=True)
    crest_image = models.ImageField(null=True)
    crest_badge_image = models.ImageField(null=True)
    total_supporter_count = models.IntegerField(default=0)
    club_color_code_first = models.CharField(max_length=7, default='#FFFFFF')
    club_color_code_second = models.CharField(max_length=7, default='#FFFFFF')
    coach_name_ja = models.CharField(max_length=255, null=True)
    venue_ja = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(default=timezone.now, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'teams'

# プレイヤー情報
class Player(models.Model):
    id = models.IntegerField(primary_key=True)
    competition_id = models.IntegerField(null=True)  
    season_id = models.IntegerField(null=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players', db_column='team_id', null=True)
    name = models.CharField(max_length=255, null=True)
    nationality = models.CharField(max_length=255, null=True)
    position = models.CharField(max_length=255, null=True)
    birthday = models.DateField(null=True)
    api_updated_at = models.DateTimeField(null=True)
    name_ja = models.CharField(max_length=255, null=True)
    is_active = models.BooleanField(default=True)
    shirt_number = models.IntegerField(null=True)
    is_national = models.BooleanField(default=False)
    national_team_id = models.IntegerField(null=True)
    national_shirt_number = models.IntegerField(null=True)
    created_at = models.DateTimeField(default=timezone.now, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'players'

class MyUserManager(BaseUserManager):
    def create_user(self, name, email, password=None):
        if not name:
            raise ValueError('Users must have an name')
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            name=name,
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, email, password):
        user = self.create_user(
            name=name,
            email=self.normalize_email(email),
            password=password,
        )
        user.is_admin=True
        user.is_staff=True
        user.is_superuser=True
        user.save(using=self._db)
        return user

class Account(AbstractBaseUser, PermissionsMixin):
    id= models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)
    email = models.EmailField(max_length=50, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    profile_image = models.ImageField(null=True, default='media/user-default')
    support_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='support_team', db_column='support_team_id', null=True)
    supported_at = models.DateTimeField(null=True)
    description = models.TextField(max_length=900, null=True)
    twitter_id = models.CharField(max_length=15, null=True)
    total_watch_count = models.IntegerField(default=0)
    total_post_count = models.IntegerField(default=0)

    objects = MyUserManager()

    #一意の識別子
    USERNAME_FIELD = 'email'
    #ユーザーを作成するときにプロンプ​​トに表示されるフィールド名
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'users'

#サポーターカウントのインクリメント処理    
@receiver(pre_save, sender=Account)
def update_supporter_count(sender, instance, **kwargs):
    try:
        obj = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        pass
    else:
        if not obj.support_team == instance.support_team:
            if obj.support_team is not None:
                obj.support_team.total_supporter_count -= 1
                obj.support_team.save()
            if instance.support_team is not None:
                instance.support_team.total_supporter_count += 1
                instance.support_team.save()

# 試合情報
class Match(models.Model):
    id = models.IntegerField(primary_key=True)
    competition_id = models.IntegerField(null=True)
    season_id = models.IntegerField(null=True)
    season_year = models.IntegerField(null=True)
    matchday = models.IntegerField(null=True)
    home_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches', db_column='home_team_id')
    away_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches', db_column='away_team_id')
    started_at = models.DateTimeField()
    status = models.CharField(max_length=255, null=True)
    winner = models.CharField(max_length=255, null=True)
    home_score = models.IntegerField(null=True)
    away_score = models.IntegerField(null=True)
    referees_id = models.IntegerField(null=True)
    referees_name = models.CharField(max_length=255, null=True)
    last_updated_at = models.DateTimeField()
    total_watch_count = models.IntegerField(default=0)
    total_post_count = models.IntegerField(default=0)
    is_national = models.BooleanField(default=False)

    class Meta:
        db_table = 'matches'

# 投稿レビュー情報
class Post(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, default=None)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='match_posts', db_column='match_id')
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='user_posts', db_column='user_id')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player_posts', db_column='player_id', null=True)
    content = models.TextField(max_length=900, null=True)
    is_highlight = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # 初めて保存される（新規作成される）場合にTrueとなる
        is_new = self.pk is None
        super().save(*args, **kwargs)  # Call the "real" save() method.
        
        # 新規作成の場合のみ、投稿数をインクリメント
        if is_new:
            self.user.total_post_count = F('total_post_count') + 1
            self.user.save()
            self.match.total_post_count = F('total_post_count') + 1
            self.match.save()

    class Meta:
        db_table = 'posts'

class Watch(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, default=None)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='match_watches', db_column='match_id')
    user = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='user_watches', db_column='user_id')

    def save(self, *args, **kwargs):
        # 初めて保存される（新規作成される）場合にTrueとなる
        is_new = self.pk is None
        super().save(*args, **kwargs)  # Call the "real" save() method.
        
        # 新規作成の場合のみ、投稿数をインクリメント
        if is_new:
            self.user.total_watch_count = F('total_watch_count') + 1
            self.user.save()
            self.match.total_watch_count = F('total_watch_count') + 1
            self.match.save()

    def delete(self, *args, **kwargs):
        # 投稿数をデクリメント
        self.user.total_watch_count = F('total_watch_count') - 1
        self.user.save()
        self.match.total_watch_count = F('total_watch_count') - 1
        self.match.save()

        # Call the "real" delete() method.
        super().delete(*args, **kwargs)

    class Meta:
        db_table = 'watches'

# ゴール情報
class Goal(models.Model):
    id = models.AutoField(primary_key=True)
    competition_id = models.IntegerField()
    season_id = models.IntegerField(null=True)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='match_goals', db_column='match_id')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team_goals', db_column='team_id')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player_goals', db_column='player_id')
    assist_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='assist_player_goals', db_column='assist_player_id', null=True)
    minute = models.IntegerField(null=True)
    additional_time = models.IntegerField(null=True)
    type = models.CharField(max_length=255, null=True)
    home_score = models.IntegerField(null=True)
    away_score = models.IntegerField(null=True)
    is_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'goals'

# 順位情報
class Standing(models.Model):
    competition_id = models.IntegerField()
    season_id = models.IntegerField()
    season_year = models.IntegerField(null=True)
    stage = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    group = models.CharField(max_length=255, default=1, null=True)
    position = models.IntegerField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team_standings', db_column='team_id')
    played_matches = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    won = models.IntegerField(default=0)
    draw = models.IntegerField(default=0)
    lost = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)
    goal_difference = models.IntegerField(default=0)
    form = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(default=timezone.now, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'standings'
        unique_together = ('competition_id', 'season_id', 'stage', 'group', 'position', 'team' )