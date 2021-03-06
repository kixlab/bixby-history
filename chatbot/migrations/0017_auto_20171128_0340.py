# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-28 03:40
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0016_auto_20171128_0316'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event_node',
            name='Event_Happen',
            field=models.TextField(default='', max_length=1000),
        ),
        migrations.AlterField(
            model_name='event_node',
            name='Event_Question',
            field=models.ManyToManyField(blank=True, null=True, to='chatbot.Question_Link'),
        ),
    ]
