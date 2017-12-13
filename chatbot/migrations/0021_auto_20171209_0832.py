# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-09 08:32
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0020_auto_20171129_0758'),
    ]

    operations = [
        migrations.AddField(
            model_name='curriculum',
            name='final_remark',
            field=models.TextField(default=''),
        ),
        migrations.AlterField(
            model_name='curriculum',
            name='Subject_Figure',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='chatbot.Figure'),
        ),
    ]
