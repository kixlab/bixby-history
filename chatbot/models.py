from django.db import models

# Create your models here.

class response(models.Model):
    response = models.TextField(default="")
    def __str__(self):
        return self.response

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
class Question_Link(models.Model):
    Link_Id = models.IntegerField(default=0)
    Link_Question = models.CharField(default = "", max_length = 200)
    def __str__(self):
        return self.Link_Question

class Event_Node(models.Model):
    Event_Id = models.IntegerField(default = 0)
    #Event_Name = models.CharField(default = "", max_length = 200)
    #Event_Cause = models.TextField(default="", max_length = 200)
    Event_Happen = models.TextField(default="", max_length = 1000)
    #Event_Aftermath = models.TextField(default="", max_length = 200)
    Figures = models.ForeignKey(Figure)
    Prerequisite_Event = models.ManyToManyField("self", null=True, blank=True, related_name='prerequisite', symmetrical = False)
    Event_Question = models.ForeignKey(Question_Link, null=True, blank=True)
    def __str__(self):
        return self.Figures.Figure_Name+"_"+self.Event_Happen



class Curriculum(models.Model):
    Curriculum_Name = models.TextField(default="")
    Subject_Figure = models.ForeignKey(Figure, blank=True, null=True)
    Curriculum_Background = models.TextField(default="")
    Curriculum_Seed_Node= models.ForeignKey(Event_Node, null=True, on_delete = models.SET_NULL)
    final_remark = models.TextField(default = "")
    def __str__(self):
        return self.Curriculum_Name
class Curriculum_Element(models.Model):
    Dependencies = models.ManyToManyField(Event_Node)
    Event_Node = models.ForeignKey(Event_Node, null=True, on_delete = models.SET_NULL, related_name="core")

    Curriculum = models.ForeignKey(Curriculum, null=True, on_delete= models.SET_NULL)
    def __str__(self):
        return self.Curriculum.Curriculum_Name+"_"+str(self.Event_Node.Event_Id)

class Prompt_Condition(models.Model):
    Curriculum = models.ForeignKey(Curriculum, null=True, on_delete = models.SET_NULL)
    Include_Conditions = models.ManyToManyField(Event_Node, blank=True, related_name = 'include_conditions')
    Exclude_Conditions = models.ManyToManyField(Event_Node, blank=True, related_name = 'exclude_conditions')
    Final_Reach_Node = models.ForeignKey(Event_Node, null = True, blank = True, on_delete = models.SET_NULL, related_name="final_reach_node")
    Question_Type = models.TextField(default="", blank = True)
    Question = models.TextField(default="", blank = True)
    Answer = models.TextField(default="")
    def __str__(self):
        return self.Question_Type+"_"+self.Answer;
