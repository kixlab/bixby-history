# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-13 11:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0021_auto_20171209_0832'),
    ]

    operations = [
        migrations.CreateModel(
            name='response',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('response', models.TextField(default='')),
            ],
        ),
    ]
