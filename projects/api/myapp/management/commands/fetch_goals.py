from django.core.management.base import BaseCommand
#from myapp.views import fetch_recent_match_goals
from myapp.views import fetch_goals_data



class Command(BaseCommand):
    help = 'fetch_goals_data'

    def handle(self, *args, **options):
        # 指定されたIDのリストを作成
        match_ids = [438500,444269,444272,438494,444273,438497,444264,438502]

       # 各IDに対して関数を実行
        for match_id in match_ids:
            fetch_goals_data(match_id)


