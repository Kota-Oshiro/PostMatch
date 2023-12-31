# Generated by Django 4.2.1 on 2023-09-10 07:17

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0035_rename_last_updated_at_player_api_updated_at_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='team',
            old_name='last_updated_at',
            new_name='api_updated_at',
        ),
        migrations.AddField(
            model_name='team',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='team',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
