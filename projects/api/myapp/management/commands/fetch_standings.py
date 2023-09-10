from django.core.management.base import BaseCommand
from myapp.views import fetch_standings_from_competitions

class Command(BaseCommand):
    help = 'fetch_standings_from_competitions'

    def handle(self, *args, **options):
        fetch_standings_from_competitions()