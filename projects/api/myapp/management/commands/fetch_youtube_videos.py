from django.core.management.base import BaseCommand
from myapp.views import fetch_youtube_videos

class Command(BaseCommand):
    help = 'fetch_youtube_videos'

    def handle(self, *args, **options):
        fetch_youtube_videos()