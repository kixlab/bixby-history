# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-28 02:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0013_auto_20171128_0250'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event_node',
            name='Event_Tag',
        ),
        migrations.AddField(
            model_name='event_node',
            name='Prerequisite_Event',
            field=models.ManyToManyField(blank=True, null=True, related_name='_event_node_Prerequisite_Event_+', to='chatbot.Event_Node'),
        ),
    ]
