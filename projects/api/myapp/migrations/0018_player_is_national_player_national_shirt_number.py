# Generated by Django 4.2.1 on 2023-08-31 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0017_rename_injurytime_goal_additional_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='is_national',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='player',
            name='national_shirt_number',
            field=models.IntegerField(null=True),
        ),
    ]