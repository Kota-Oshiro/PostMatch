# Generated by Django 4.2.1 on 2023-08-20 14:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0009_player_is_active_player_name_ja_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='position',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
