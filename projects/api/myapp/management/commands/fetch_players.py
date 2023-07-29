from django.core.management.base import BaseCommand
from myapp.views import fetch_and_store_players_data  # 適切なインポートパスに変更してください

class Command(BaseCommand):
    help = 'Fetches and stores players data'

    def handle(self, *args, **options):
        fetch_and_store_players_data()