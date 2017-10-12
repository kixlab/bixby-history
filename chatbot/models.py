from django.db import models

# Create your models here.


class Figure(models.Model):
    Figure_Id = models.IntegerField(default=0)
    Figure_Name = models.CharField(default = "", max_length=200)
    def __str__(self):
        return self.Figure_Name
class Event_Tag(models.Model):
    Event_Tag_Id = models.IntegerField(default = 0)
    Event_Tag_Name = models.CharField(default="", max_length=200)
    def __str__(self):
        return self.Event_Tag_Name

class Event_Node(models.Model):
    Event_Id = models.IntegerField(default = 0)
    #Event_Name = models.CharField(default = "", max_length = 200)
    #Event_Cause = models.TextField(default="", max_length = 200)
    Event_Happen = models.TextField(default="", max_length = 200)
    #Event_Aftermath = models.TextField(default="", max_length = 200)
    Figures = models.ManyToManyField(Figure)
    Event_Tag = models.ManyToManyField(Event_Tag)
    def __str__(self):
        return self.Event_Happen
class Question_Link(models.Model):
    Link_Id = models.IntegerField(default=0)
    Link_Question = models.CharField(default = "", max_length = 200)
    Leading_Event = models.ForeignKey(Event_Node, null=True, on_delete = models.SET_NULL, related_name='leading_event')
    Causing_Event = models.ForeignKey(Event_Node, null=True, on_delete = models.SET_NULL, related_name='causing_event')
    def __str__(self):
        return self.Link_Question


class Curriculum(models.Model):
    Curriculum_Name = models.TextField(default="")
    Curriculum_Seed_Node= models.ForeignKey(Event_Node, null=True, on_delete = models.SET_NULL)
    def __str__(self):
        return self.Curriculum_Name
class Curriculum_Element(models.Model):
    Dependencies = models.ManyToManyField(Event_Node)
    Event_Node = models.ForeignKey(Event_Node, null=True, on_delete = models.SET_NULL, related_name="core")

    Curriculum = models.ForeignKey(Curriculum, null=True, on_delete= models.SET_NULL)
    def __str__(self):
        return self.Curriculum.Curriculum_Name+"_"+str(self.Event_Node.Event_Id)
