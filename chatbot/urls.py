from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^fig_who/$', views.fig_who, name='fig_who'),
    url(r'^fig_next/$', views.fig_next, name='fig_next'),
    url(r'^ev_what/$', views.ev_what, name='ev_what'),
    url(r'^ev_next/$', views.ev_next, name='ev_next'),
    url(r'^retrieve_question_with_id/$', views.retrieve_question_with_id, name='retrieve_question_with_id'),
    url(r'^$', views.index, name='index'),
]
