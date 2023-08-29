from django.core.management.base import BaseCommand
from myapp.views import fetch_recent_match_goals
#from myapp.views import fetch_goals_data

class Command(BaseCommand):
    help = 'fetch_recent_match_goals'

    def handle(self, *args, **options):
        fetch_recent_match_goals()

''' match_id指定でgoalsをfetchしたいとき用

class Command(BaseCommand):
    help = 'fetch_goals_data'

    def handle(self, *args, **options):
        # 指定されたIDのリストを作成
        match_ids = [438478,435957,438493]

       # 各IDに対して関数を実行
        for match_id in match_ids:
            fetch_goals_data(match_id)

'''

