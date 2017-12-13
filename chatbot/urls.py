from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^curriculum_retrieval', views.curriculum_retrieval, name='curriculum_retrieval'),
    url(r'^curriculum_save', views.curriculum_save, name='curriculum_save'),
    url(r'^curriculum/$', views.curriculum, name='curriculum'),
    url(r'^retrieve_possible_questions/$', views.retrieve_possible_questions, name='retrieve_possible_questions'),
    url(r'^retrieve_timeline/$', views.retrieve_timeline, name='retrieve_timeline'),
    url(r'^get_all_figures/$', views.get_all_figures, name='get_all_figures'),
    url(r'^fig_who/$', views.fig_who, name='fig_who'),
    url(r'^fig_next/$', views.fig_next, name='fig_next'),
    url(r'^ev_what/$', views.ev_what, name='ev_what'),
    url(r'^ev_next/$', views.ev_next, name='ev_next'),
    url(r'^pile_response/$', views.pile_response, name='pile_response'),
    url(r'^retrieve_question_with_id/$', views.retrieve_question_with_id, name='retrieve_question_with_id'),
    url(r'^$', views.index, name='index'),
]
