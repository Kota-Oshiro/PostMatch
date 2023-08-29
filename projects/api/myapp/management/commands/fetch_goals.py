from django.core.management.base import BaseCommand
#from myapp.views import fetch_recent_match_goals
from myapp.views import fetch_goals_data


class Command(BaseCommand):
    help = 'fetch_goals_data'

    def handle(self, *args, **options):
        # 指定されたIDのリストを作成
        match_ids = [438488,438487,444259,444263,438484,444262,438486,444254,435954,438489,438503,435968,438495,435963,435964,435965,435969,435970,435966,444266,444271,438496,438498,444267,444270,438499,435967,435972,435971,438501,444265,444268,438500,444269,444272,438494,444273,438497,444264,438502]

       # 各IDに対して関数を実行
        for match_id in match_ids:
            fetch_goals_data(match_id)


