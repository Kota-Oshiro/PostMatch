from django.core.management.base import BaseCommand
#from myapp.views import fetch_recent_match_goals
from myapp.views import fetch_goals_data

''' match_id指定でgoalsをfetchしたいとき用

class Command(BaseCommand):
    help = 'fetch_recent_match_goals'

    def handle(self, *args, **options):
        fetch_recent_match_goals()

''' 

class Command(BaseCommand):
    help = 'fetch_goals_data'

    def handle(self, *args, **options):
        # 指定されたIDのリストを作成
        match_ids = [438478,435957,438493,444257,444258,435958,438485,435953,435961,444260,444261,438484,444262,438503,444268,438500,444269,444272,438494,444273,438497,444264,438502]

       # 各IDに対して関数を実行
        for match_id in match_ids:
            fetch_goals_data(match_id)


