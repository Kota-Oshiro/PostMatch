# Generated by Django 4.2.1 on 2023-09-10 19:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0037_alter_goal_season_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='goal',
            name='additional_time',
            field=models.IntegerField(null=True),
        ),
    ]
