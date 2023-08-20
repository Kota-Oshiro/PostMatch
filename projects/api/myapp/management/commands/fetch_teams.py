from django.core.management.base import BaseCommand
from myapp.views import fetch_teams_from_competitions

class Command(BaseCommand):
    help = 'fetch_teams_from_competitions'

    def handle(self, *args, **options):
        fetch_teams_from_competitions()