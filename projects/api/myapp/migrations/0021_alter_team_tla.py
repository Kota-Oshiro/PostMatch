# Generated by Django 4.2.1 on 2023-08-31 15:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0020_alter_team_coach_name_ja_alter_team_venue_ja'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='tla',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
