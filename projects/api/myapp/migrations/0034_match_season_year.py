# Generated by Django 4.2.1 on 2023-09-10 06:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0033_goal_created_at_goal_updated_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='season_year',
            field=models.IntegerField(null=True),
        ),
    ]
