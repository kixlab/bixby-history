# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-28 14:34
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0018_auto_20171128_1103'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event_node',
            name='Event_Question',
        ),
        migrations.AddField(
            model_name='event_node',
            name='Event_Question',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='chatbot.Question_Link'),
        ),
    ]
