# Generated by Django 4.2.1 on 2023-09-10 19:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0036_rename_last_updated_at_team_api_updated_at_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='goal',
            name='season_id',
            field=models.IntegerField(null=True),
        ),
    ]
