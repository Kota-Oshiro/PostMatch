# Generated by Django 4.2.1 on 2023-06-24 05:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0005_alter_team_coach_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='coach_name',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
