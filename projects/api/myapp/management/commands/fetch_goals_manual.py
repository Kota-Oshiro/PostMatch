from django.core.management.base import BaseCommand
from myapp.views import fetch_goals_data

# match_id指定でgoalsをfetchしたいとき用

class Command(BaseCommand):
    help = 'fetch_goals_data'

    # 引数定義
    def add_arguments(self, parser):
        parser.add_argument('match_ids', nargs='+', type=int, help='List of match IDs')

    def handle(self, *args, **options):
        # コマンドラインからの入力を取得
        match_ids = options['match_ids']

        # 各IDに対して関数を実行
        for match_id in match_ids:
            fetch_goals_data(match_id)
