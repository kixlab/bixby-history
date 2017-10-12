from django.shortcuts import render
from django.db.models import Q
from .models import Event_Node, Question_Link, Figure, Event_Tag, Curriculum, Curriculum_Element
import json
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
# Create your views here.
def index(request):
    return render(request, 'chatbot/chatbot.html', {})

def curriculum(request):
    return render(request, 'chatbot/curriculum.html', {})

def curriculum_save(request):
    name = request.GET.get('name')
    start_event_id = int(request.GET.get('start_event_id'))
    selected = json.loads(request.GET.get('selected'))
    seed_node = Event_Node.objects.get(Event_Id = start_event_id)
    curri = Curriculum(Curriculum_Name=name, Curriculum_Seed_Node=seed_node)
    curri.save()
    for sel in selected:
        ev_node = Event_Node.objects.get(Event_Id = sel['id'])
        cur_ele = Curriculum_Element(Event_Node=ev_node, Curriculum = curri)
        cur_ele.save()
        for num in sel['dependency']:
            ev_n = Event_Node.objects.get(Event_Id = num)
            cur_ele.Dependencies.add(ev_n)
        cur_ele.save()

    print(selected)
    data = {

    }
    return JsonResponse(data)

def get_all_figures(request):
    figures = Figure.objects.all()
    events = Event_Tag.objects.all()
    figure_list = []
    event_list = []
    for figure in figures:
        figure_list.append(figure.Figure_Name)
    for event in events:
        event_list.append(event.Event_Tag_Name)
    data = {
        'figure_list' : json.dumps(figure_list),
        'event_list' : json.dumps(event_list),
    }
    return JsonResponse(data)

def retrieve_timeline(request):
    selected_ids = json.loads(request.GET.get("selected_ids"))
    figure_keywords = json.loads(request.GET.get("figure_keywords"))
    event_keywords = json.loads(request.GET.get("event_keywords"))
    figure_list = []
    event_list = []
    for figure_keyword in figure_keywords:
        figure = Figure.objects.get(Figure_Name = figure_keyword)
        figure_list.append(figure)
    for event_keyword in event_keywords:
        event = Event_Tag.objects.get(Event_Tag_Name = event_keyword)
        event_list.append(event)

    print(event_list)
    event_nodes = Event_Node.objects.all()
    if len(event_list) !=0 and len(figure_list) !=0:
        event_nodes = event_nodes.filter(Q(Event_Tag__in =event_list) | Q(Figures__in = figure_list) | Q(Event_Id__in=selected_ids)).distinct()
    elif len(event_list) != 0:
        event_nodes = event_nodes.filter(Q(Event_Tag__in =event_list)| Q(Event_Id__in=selected_ids)).distinct()
    elif len(figure_list) != 0:
        event_nodes = event_nodes.filter(Q(Figures__in = figure_list)| Q(Event_Id__in=selected_ids)).distinct()
    event_nodes = event_nodes.order_by('Event_Id')
    events = []
    event_description=[]
    event_id=[]
    event_figures=[]
    event_tags=[]
    for event_node in event_nodes:
        event = {}
        event['description'] = event_node.Event_Happen
        event['id']=event_node.Event_Id
        fig_list = []
        F = event_node.Figures.all()
        for fig in F:
            fig_list.append(fig.Figure_Name)
        event['figures']=fig_list
        ev_list = []
        E = event_node.Event_Tag.all()
        for ev in E:
            ev_list.append(ev.Event_Tag_Name)
        event['tags']=ev_list
        events.append(event)
    print(events)

    data = {
        'events':json.dumps(events)
    }
    return JsonResponse(data)

def retrieve_question_with_id(request):
    ev_id = int(request.GET.get('id'))
    output = Event_Node.objects.get(Event_Id=ev_id)
    figures = output.Figures.all()
    figure_list = []
    for figure in figures:
        figure_list.append(figure.Figure_Name)
    event_tag_list=[]
    entire_event_tags = Event_Tag.objects.all()
    for event_tag in entire_event_tags:
        if event_tag.Event_Tag_Name in output.Event_Happen:
            event_tag_list.append(event_tag.Event_Tag_Name)
    data = {
        'output': output.Event_Happen,
        'figure_list': json.dumps(figure_list),
        'event_tag_list': json.dumps(event_tag_list),
    }
    return JsonResponse(data)

def fig_who(request):
    fig = request.GET.get("figure")
    figure = Figure.objects.get(Figure_Name = fig)
    fig_event = Event_Node.objects.filter(Figures__in =[figure]).order_by('Event_Id')[0]
    data ={
        'Event_Id': fig_event.Event_Id
    }
    return JsonResponse(data)
def fig_next(request):
    figlist = json.loads(request.GET.get("figures"))
    last_ev = int(request.GET.get("cur_ev_id"))
    print(figlist)
    filtered_events = Event_Node.objects.filter(Event_Id__gt=last_ev)
    for fig in figlist:
        figure = Figure.objects.get(Figure_Name = fig)
        filtered_events = filtered_events.filter(Figures__in=[figure])
    filtered_events = filtered_events.order_by('Event_Id')
    if len(filtered_events)==0:
        data={
            'retrieved':False,
        }
    else:
        data={
            'retrieved':True,
            'Event_Id': filtered_events[0].Event_Id
        }
    print(filtered_events)
    return JsonResponse(data)

def ev_what(request):
    ev = request.GET.get("event_tag_name")
    event_tag = Event_Tag.objects.get(Event_Tag_Name = ev)
    return_ev = Event_Node.objects.filter(Event_Tag__in=[event_tag]).order_by("Event_Id")[0]
    data={
        'Event_Id': return_ev.Event_Id
    }
    return JsonResponse(data)

def ev_next(request):
    cur_ev_id = int(request.GET.get("cur_ev_id"))
    cur_ev = Event_Node.objects.get(Event_Id = cur_ev_id)
    return_ev_set = Event_Node.objects.filter(Event_Tag__in=cur_ev.Event_Tag.all()).filter(Event_Id__gt=cur_ev_id).order_by('Event_Id')
    if len(return_ev_set)==0:
        data={
            'retrieved': False,
        }
    else:
        data={
            'retrieved': True,
            'Event_Id': return_ev_set[0].Event_Id
        }
    return JsonResponse(data)
