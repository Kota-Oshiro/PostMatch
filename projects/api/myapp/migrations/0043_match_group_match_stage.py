# Generated by Django 4.2.1 on 2023-09-13 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0042_alter_match_away_team_alter_match_home_team'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='group',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='match',
            name='stage',
            field=models.CharField(max_length=255, null=True),
        ),
    ]