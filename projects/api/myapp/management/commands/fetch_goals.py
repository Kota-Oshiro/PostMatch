from django.core.management.base import BaseCommand
from myapp.views import fetch_recent_match_goals

class Command(BaseCommand):
    help = 'fetch_recent_match_goals'

    def handle(self, *args, **options):
        fetch_recent_match_goals()