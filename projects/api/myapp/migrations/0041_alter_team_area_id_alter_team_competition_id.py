# Generated by Django 4.2.1 on 2023-09-12 19:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0040_rename_badge_image_team_badge_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='area_id',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='team',
            name='competition_id',
            field=models.IntegerField(null=True),
        ),
    ]
