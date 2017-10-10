var init_ev_id = 22;
var cur_ev_id = init_ev_id;
var answer_ev_id = 21;
var init_ev_output="";
var initialized=false;
var answer_found = false;
//figures and event_tags that are seen to current stage
var figure_list=[];
var event_tag_list=[];
//dealt event id
var dealt_event_id_list=[];
//figure list and event tag of currently explained event
var cur_figure_list;
var cur_event_tag="";
//question infos that user can choose
var figure_who_question=[]
var figure_next_question=[]

$(document).ready(function(){
  initialize(init_ev_id);
  elements_fit_size();
  window.onresize = function(event){
    elements_fit_size();
  }

})
initialize = function(id){
  retrieve_output(id);
}


retrieve_output = function(id){
  $.ajax({
    url: '/chatbot/retrieve_question_with_id',
    data:{
      "id": id,
    },
    dataType: 'json',
    success : function(data){
      if(initialized==false){
        init_ev_output = data.output;
        initialized = true;
        console.log(init_ev_output)
      }
      $("#chat_display_container").append("<div class='chatbot_output'>"+data.output+"</div>")
      if(cur_ev_id == answer_ev_id && !answer_found){
        answer_found = true;
        $("#chat_display_container").append("<div class='chatbot_output'>이 사건이 '"+init_ev_output+"'에 대한 직접적인 원인인 것 같군요.</div>")
        $("#chat_display_container").append("<div class='chatbot_output'>답을 찾느라 수고하셨습니다! 사건에 대해서 더 알고 싶으시다면 자유롭게 더 질문을 하시면 됩니다.</div>")
      }
      var received_figures = JSON.parse(data.figure_list);
      cur_figure_list = received_figures;
      for(var i=0; i<received_figures.length; i++){
        if(figure_list.indexOf(received_figures[i])<0){
          figure_list.push(received_figures[i])
        }
      }
      var received_event_tags = JSON.parse(data.event_tag_list)
      for(var i=0; i<received_event_tags.length; i++){
        if(event_tag_list.indexOf(received_event_tags[i])<0){
          event_tag_list.push(received_event_tags[i])
        }
      }
      console.log(figure_list)
      console.log(event_tag_list)
      console.log(cur_figure_list)
      generate_question_infos()
    },
    error : function(data){
      alert("id_question error")
    }
  })
}
generate_question_infos = function(){
  $("#chat_input_selector").empty();
  //who question - can be retrieved from all figures have been seen til now
  figure_who_question=[];
  for(var i=0; i<figure_list.length; i++){
    figure_who_question.push(figure_list[i]);
    $("#chat_input_selector").append("<div class='fig_who chat_input_button' value="+i.toString()+">"+figure_list[i]+"은(는) 무엇을 한 사람인가요?</div>")
  }
  //who next question - multiple - about figures in the current figure list
  figure_next_question=[]
  figure_next_question = get_comb(cur_figure_list);
  for(var i=0; i<figure_next_question.length; i++){
    var input="";
    if(figure_next_question[i].length==1){
      input = figure_next_question[i][0]+"은(는) 이후에 또 무엇을 하였나요?"
    }else{
      for(var j=0; j<figure_next_question[i].length; j++){
        input = input + figure_next_question[i][j];
        if(j!=figure_next_question[i].length-1){
          input = input+"와(과) ";
        }
      }
      input = input + "은(는) 이후에 또 무엇을 함께 같이 했나요?"
    }
    $("#chat_input_selector").append("<div class='fig_next chat_input_button' value="+i.toString()+">"+input+"</div>")

  }
  //event 사건
  for(var i=0; i<event_tag_list.length; i++){
    $("#chat_input_selector").append("<div class='ev_what chat_input_button' value="+i.toString()+">"+event_tag_list[i]+"은(는) 무슨 사건인가요?</div>")
  }
  $("#chat_input_selector").append("<div class='ev_next chat_input_button'>지금 말씀하신 것 다음에는 어떤 일이 일어났죠?</div>")
  console.log(figure_next_question);

  $(".chat_input_button").on("mouseover", function(){
    $(this).css('background-color', "#cccccc")
  }).on("mouseout", function(){
    $(this).css("background-color", "transparent")
  }).on("click", function(){
    var input = $(this).text();
    $("#chat_display_container").append("<div class='user_input'>"+input+"</div>")
    console.log($(this).attr("class"))
    if($(this).attr("class").includes("fig_who")){
      fig_who(parseInt($(this).attr('value')))
    }else if($(this).attr("class").includes("fig_next")){
      fig_next(parseInt($(this).attr('value')))
    }else if($(this).attr("class").includes("ev_what")){
      ev_what(parseInt($(this).attr('value')))
    }else if($(this).attr("class").includes("ev_next")){
      ev_next()
    }

    $('#chat_display_container').stop().animate({
      scrollTop: $('#chat_display_container')[0].scrollHeight
    }, 800);
  })
}

fig_who = function(val){
  $.ajax({
    url: '/chatbot/fig_who',
    data:{
      'figure': figure_who_question[val],
    },
    dataType: 'json',
    success: function(data){
      cur_ev_id = data.Event_Id;

      retrieve_output(cur_ev_id);
    },
    error: function(data){

    }
  })
}
fig_next = function(val){
  $.ajax({
    url: '/chatbot/fig_next',
    data:{
      'figures' : JSON.stringify(figure_next_question[val]),
      'cur_ev_id' : cur_ev_id,
    },
    dataType: 'json',
    success: function(data){
      var retrieved = data.retrieved;
      if(retrieved){
        cur_ev_id = data.Event_Id;
        retrieve_output(cur_ev_id);
      }else{
        $("#chat_display_container").append("<div class='chatbot_output'>이 이후로 이 인물에 대해 알 수 있는 것이 없네요.</div>")

      }
    },
    error: function(data){

    }
  })
}
ev_what=function(val){
  $.ajax({
    url: '/chatbot/ev_what',
    data:{
      'event_tag_name': event_tag_list[val],
    },
    dataType: 'json',
    success: function(data){
      cur_ev_id = data.Event_Id;
      retrieve_output(cur_ev_id);
    },
    error: function(data){

    }
  })
}
ev_next=function(){
  $.ajax({
    url: '/chatbot/ev_next',
    data:{
      'cur_ev_id': cur_ev_id,
    },
    dataType: 'json',
    success: function(data){
      var retrieved = data.retrieved;
      if(retrieved){
        cur_ev_id = data.Event_Id;
        retrieve_output(cur_ev_id);
      }else{
        $("#chat_display_container").append("<div class='chatbot_output'>이 이후로 이 사건에 대해 알 수 있는 것이 없네요.</div>")

      }
    },
    error: function(data){

    }
  })
}

get_comb = function(figure_list){
  var result = []
  var get_comb_iter = function(figures, prev){

    for(var i=0; i<figures.length; i++){
      console.log(figures.length)
      var prev_copy = prev.slice();
      prev_copy.push(figures[i]);
      console.log(prev_copy);
      result.push(prev_copy);
      console.log(i);
      get_comb_iter(figures.slice(i+1), prev_copy);

    }
  }
  get_comb_iter(figure_list, []);
  return result;
}


elements_fit_size = function(){
  var chatbot_input_height = $("#chat_input").height();
  var chatbot_display_height = $("#chat_display").height();
  $("#chat_input_container").height(chatbot_input_height-20);
  $("#chat_display_container").height(chatbot_display_height-20);
}
