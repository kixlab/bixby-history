from django.contrib import admin
from .models import Figure, Event_Node, Question_Link, Event_Tag
# Register your models here.
admin.site.register(Figure)
admin.site.register(Event_Node)
admin.site.register(Question_Link)
admin.site.register(Event_Tag)
