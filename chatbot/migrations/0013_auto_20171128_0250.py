# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-28 02:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0012_event_node_event_question'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event_node',
            name='Event_Tag',
            field=models.ManyToManyField(related_name='_event_node_Event_Tag_+', to='chatbot.Event_Node'),
        ),
    ]
