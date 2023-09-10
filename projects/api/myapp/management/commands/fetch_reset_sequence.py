from django.core.management.base import BaseCommand
from myapp.views import reset_sequence
from myapp.models import Standing

class Command(BaseCommand):
    help = 'reset_sequence'

    def handle(self, *args, **options):
        reset_sequence(Standing)