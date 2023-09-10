# Generated by Django 4.2.1 on 2023-09-10 05:48

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0031_alter_standing_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='standing',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='standing',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
