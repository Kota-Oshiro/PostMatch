from django.core.management.base import BaseCommand
from myapp.views import fetch_matches_from_competitions  # 適切なインポートパスに変更してください

class Command(BaseCommand):
    help = 'fetch_matches_from_competitions'

    def handle(self, *args, **options):
        fetch_matches_from_competitions()