from django.core.management.base import BaseCommand
from myapp.views import fetch_and_store_matches_data  # 適切なインポートパスに変更してください

class Command(BaseCommand):
    help = 'Fetches and stores matches data'

    def handle(self, *args, **options):
        fetch_and_store_matches_data()