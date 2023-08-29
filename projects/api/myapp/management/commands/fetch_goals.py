from django.core.management.base import BaseCommand
#from myapp.views import fetch_recent_match_goals
from myapp.views import fetch_goals_data


class Command(BaseCommand):
    help = 'fetch_goals_data'

    def handle(self, *args, **options):
        # 指定されたIDのリストを作成
        match_ids = [438482,435943,438479,435944,435945,435946,435947,435948,438481,435949,438483,438474,435950,438476,435951,438480,438478,438477,435952,438475,438491,435959,438490,435957,435955,435956,435962,438492,435960,444255,444256,438493,444257,444258,435958,438485,435953,435961,444260,444261]

       # 各IDに対して関数を実行
        for match_id in match_ids:
            fetch_goals_data(match_id)


