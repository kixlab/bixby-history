from django.contrib import admin
from .models import response, Figure, Event_Node, Question_Link, Event_Tag, Curriculum, Curriculum_Element
from .models import Prompt_Condition
# Register your models here.
admin.site.register(Figure)
admin.site.register(Event_Node)
admin.site.register(Question_Link)
admin.site.register(Event_Tag)
admin.site.register(Curriculum)
admin.site.register(Curriculum_Element)
admin.site.register(Prompt_Condition)
admin.site.register(response)
