# Generated by Django 4.2.1 on 2023-09-03 07:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0025_alter_goal_is_valid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='tla',
            field=models.CharField(max_length=255),
        ),
    ]
