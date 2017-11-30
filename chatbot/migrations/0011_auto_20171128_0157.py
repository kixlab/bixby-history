# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-11-28 01:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0010_auto_20171121_0536'),
    ]

    operations = [
        migrations.AddField(
            model_name='curriculum',
            name='Curriculum_Background',
            field=models.TextField(default=''),
        ),
        migrations.AlterField(
            model_name='prompt_condition',
            name='Exclude_Conditions',
            field=models.ManyToManyField(blank=True, related_name='exclude_conditions', to='chatbot.Event_Node'),
        ),
        migrations.AlterField(
            model_name='prompt_condition',
            name='Include_Conditions',
            field=models.ManyToManyField(blank=True, related_name='include_conditions', to='chatbot.Event_Node'),
        ),
        migrations.AlterField(
            model_name='prompt_condition',
            name='Question',
            field=models.TextField(blank=True, default=''),
        ),
    ]
