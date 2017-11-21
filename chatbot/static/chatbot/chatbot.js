var curriculum_name = "test2";
var init_ev_id; //22;
var cur_ev_id = init_ev_id;
var answer_ev_id;// = 21;
var related_id;
var init_ev_output="";
var related_exist = false;
var initialized=false;
var answer_found = false;
var last_info="";
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
//events that can be seen
var events_can_be_seen=[]
//events that cannot be seen initially
var dependent_events=[]
//whether to or not to give feedback about user's input
var give_neg_feedback = false;
var related_utterances = [
  "관련 높아 보이는 정보를 찾은 것 같은데요?",
  "이 정보 조금 중요할 수도 있겠는데요?",
]
//make users answer the prompt
var prompt_conditions;
var prompt_queue;
var prompt_ids;
var do_prompting = false;
var cur_prompting;

var output_queue=[];
$(document).ready(function(){
  initialize();
  elements_fit_size();
  window.onresize = function(event){
    elements_fit_size();
  }

})
initialize = function(){
  curriculum_name = "test1"// prompt("curriculum name is ");
  console.log("het")
  $.ajax({
    url: '/chatbot/curriculum_retrieval',
    data:{
      'cur_name': curriculum_name,
    },
    dataType: 'json',
    success : function(data){
      events_can_be_seen = JSON.parse(data.events_can_be_seen)
      dependent_events = JSON.parse(data.dependent_events)
      prompt_conditions = JSON.parse(data.prompt_conditions)
      init_ev_id = data.init_ev_id
      cur_ev_id = init_ev_id
      answer_ev_id = data.answer_ev_id
      retrieve_output(init_ev_id);

//      console.log(events_can_be_seen)
//      console.log(dependent_events)
      console.log(prompt_conditions)
    },
    error : function(data){

    }
  })

}


retrieve_output = function(id, dooutput=true){
  var was_related = related_exist;
  related_exist = false;
  $.ajax({
    url: '/chatbot/retrieve_question_with_id',
    data:{
      "id": id,
    },
    dataType: 'json',
    success : function(data){
      last_info = data.output;
      if(dooutput){

      var recurrence = dealt_event_id_list.includes(id)
      if(dealt_event_id_list.includes(id)){
        output_queue.push("<div class='chatbot_output'>이미 한 번 설명해 드린 것 같지만요.</div>");
        //$("#chat_display_container").append("<div class='chatbot_output'>이미 한 번 설명해 드린 것 같지만요.</div>")
      }else{
        dealt_event_id_list.push(id);
      }
      //dependency_update();
      if(initialized==false){
        init_ev_output = data.output;
        initialized = true;
        console.log(init_ev_output)
      }
      output_queue.push("<div class='chatbot_output info' value="+id.toString()+">"+data.output+"</div>");
      //$("#chat_display_container").append("<div class='chatbot_output info' value="+id.toString()+">"+data.output+"</div>")
      if(cur_ev_id == answer_ev_id && !answer_found){
        answer_found = true;
        output_queue.push("<div class='chatbot_output'>이 사건이 '"+init_ev_output+"'에 대한 직접적인 원인인 것 같군요.</div>")
        //$("#chat_display_container").append("<div class='chatbot_output'>이 사건이 '"+init_ev_output+"'에 대한 직접적인 원인인 것 같군요.</div>")
        output_queue.push("<div class='chatbot_output'>왜 이게 직접적인 원인이 되는지에 대해서 혹시 생각이 있으신가요? 혹은 직접적인 원인이 아니라고 생각하시나요?</div>")
        return do_prompt(false);
        //$("#chat_display_container").append("<div class='chatbot_output'>답을 찾느라 수고하셨습니다! 사건에 대해서 더 알고 싶으시다면 자유롭게 더 질문을 하시면 됩니다.</div>")
      }else{
        var pass= false;
        for(var i=0; i<dependent_events.length; i++){
          if(dependent_events[i].Event_Id == cur_ev_id){
            seems_related(recurrence, was_related);

              for(var j=0; j<dependent_events[i].Dependent.length; j++){
                if(!dealt_event_id_list.includes(dependent_events[i].Dependent[j])){
                  related_id = dependent_events[i].Dependent[j]
                  related_exist = true;
                  output_queue.push("<div class='chatbot_output'>이 사건 전에 일어난 관련이 깊은 다른 사건이 있는 것 같아요. 궁금하시면 더 찾아볼게요.</div>")
                  //$("#chat_display_container").append("<div class='chatbot_output'>이 사건 전에 일어난 관련이 깊은 다른 사건이 있는 것 같아요. 궁금하시면 더 찾아볼게요.</div>")
                  break;
                }
              }

            pass = true;
            give_neg_feedback = true;
            break;
          }
        }
        if(!pass && give_neg_feedback){
          give_neg_feedback = false;
          //output_queue.push("<div class='chatbot_output'>좀 엇나간 것 같은데...</div>")
          //$("#chat_display_container").append("<div class='chatbot_output'>좀 엇나간 것 같은데...</div>")
        }
        prompt_queue = []
        prompt_ids = []
        for(var i=0; i<prompt_conditions.length; i++){
          var prompt_condition = prompt_conditions[i]
          console.log(cur_ev_id)
          console.log(prompt_condition['trigger'])
          if((prompt_condition['trigger'] == null) ||(prompt_condition['trigger']==cur_ev_id)){

            var first_pass = true;
            for (var j=0; j<prompt_condition['exclude'].length; j++){
              if(dealt_event_id_list.indexOf(prompt_condition['exclude'][j])>=0){
                first_pass =false;
                break;
              }
            }
            if(first_pass){
              var second_pass = true;
              for (var j=0; j<prompt_condition['include'].length; j++){
                if(dealt_event_id_list.indexOf(prompt_condition['include'][j])<0){
                  second_pass =false;
                  break;
                }
              }
              if(second_pass){
                console.log("question upcoming!");
                prompt_queue.push(prompt_condition)
                prompt_ids.push(i)
                //$("#chat_input_selector").empty();
                //TODO prompt
              }
            }
          }
        }
        if(prompt_queue.length >0){
          console.log(prompt_conditions)
          for(var i=0; i<prompt_ids.length; i++){
            prompt_conditions.splice(prompt_ids[i],1)
          }
          do_prompt();
          return;
        }else{
          clear_output_queue();
        }
      }}else{
        $("#chat_display_container").append("<div class='user_input info' value="+id.toString()+">"+data.output+"</div>")
        $("#chat_display_container").append("<div class='user_input'>이 사건 있지 않습니까...</div>")
        attention_to_bottom();
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
      //console.log(figure_list)
      //console.log(event_tag_list)
      //console.log(cur_figure_list)
      generate_question_infos(related_exist)
    },
    error : function(data){
      alert("id_question error")
    }
  })
}

do_prompt = function(not_end=true){
  if(not_end){
    cur_prompting =prompt_queue.pop()
    //append chatbot output
    output_queue.push("<div class='chatbot_output'>"+cur_prompting['question']+"</div>")
  }
  clear_output_queue();
  //$("#chat_display_container").append("<div class='chatbot_output'>"+cur_prompting['question']+"</div>")
  //clear input, leave text area
  $("#chat_input_selector").empty();
  $("#chat_input_selector").append("<textarea id='prompt_input'></textarea>")
  $("#prompt_input").focus().outerHeight($("#chat_input_selector").height()).outerWidth($("#chat_input_selector").width())
  $("#prompt_input").off("keydown").on('keydown', function(){
    if(event.keyCode==13){
      $(this).off('keydown')
      if(not_end){
        do_prompt_second();
      }else{
        do_prompt_third(not_end);
      }
    }
  })
  $("#return").css("visibility", "visible").on("click", function(){
    $(this).off('click')
    if(not_end){
      do_prompt_second();
    }else{
      do_prompt_third(not_end);
    }
  })

}

do_prompt_second = function(){
  //output
  $("#chat_display_container").append("<div class='user_input'>"+$("#prompt_input").val()+"</div>")
  //$("#prompt_input");
  output_queue.push("<div class='chatbot_output'>"+cur_prompting['answer']+"</div>")
  //$("#chat_display_container").append("<div class='chatbot_output'>"+cur_prompting['answer']+"</div>")
  output_queue.push("<div class='chatbot_output'>저와 당신의 생각이 비슷한 것 같나요 아니면 많이 다른 것 같나요?</div>")
  //$("#chat_display_container").append("<div class='chatbot_output'>저와 당신의 생각이 비슷한 것 같나요 아니면 많이 다른 것 같나요?</div>")
  attention_to_bottom();
  clear_output_queue();
  //see the queue
  $("#prompt_input").val('').focus().off("keydown").on('keydown', function(event){
    if(event.keyCode==13){
      $(this).off('keydown')
      do_prompt_third();
    }
  })
  $("#return").off("click").on("click", function(){
    $(this).off('click')
    do_prompt_third();
  })

}

do_prompt_third = function(not_end=true){

  $("#chat_display_container").append("<div class='user_input'>"+$("#prompt_input").val()+"</div>")

  output_queue.push("<div class='chatbot_output'>왜 그렇게 생각하세요? 혹시 그렇게 생각하는 뚜렷한 증거가 있나요?</div>")
  clear_output_queue()
  //$("#chat_display_container").append("<div class='chatbot_output'>왜 그렇게 생각하세요? 혹시 그렇게 생각하는 뚜렷한 증거가 있나요?</div>")
  attention_to_bottom();
  $("#prompt_input").val('').focus().off("keydown").on('keydown', function(event){
    if(event.keyCode==13){
    $(this).off('keydown')
    do_prompt_fourth(not_end);
  }
  })
  $("#return").off("click").on("click", function(){
    $(this).off('click')
    do_prompt_fourth(not_end);
  })
}

do_prompt_fourth = function(not_end = true){
  $("#chat_display_container").append("<div class='user_input'>"+$("#prompt_input").val()+"</div>")
  output_queue.push("<div class='chatbot_output'>생각을 이야기해줘서 고마워요. 다른 사람은 어떻게 생각하는지 궁금했어요.</div>")
  //$("#chat_display_container").append("<div class='chatbot_output'>생각을 이야기해줘서 고마워요. 다른 사람은 어떻게 생각하는지 궁금했어요.</div>")

  if(prompt_queue.length>0){
    output_queue.push("<div class='chatbot_output'>음, 근데 이야기하고 싶은게 하나 더 있어요</div>")
    //$("#chat_display_container").append("<div class='chatbot_output'>음, 근데 이야기하고 싶은게 하나 더 있어요</div>")
    attention_to_bottom();
    do_prompt();
  }else if(not_end){
    output_queue.push("<div class='chatbot_output'>그럼 궁금한 것이 있으시면 또 물어보세요! 마지막으로 다음과 관련된 이야기를 하고 있었네요.</div>")
    output_queue.push("<div class='chatbot_output info' value="+cur_ev_id.toString()+">"+last_info+"</div>");
    clear_output_queue();
    //$("#chat_display_container").append("<div class='chatbot_output'>그럼 궁금한 것이 있으시면 또 물어보세요!</div>")
    attention_to_bottom();
    //retrieve_output(cur_ev_id);
    generate_question_infos(related_exist);
  }else{
    //prompt_condition=[]
    output_queue.push("<div class='chatbot_output'>답을 찾느라 수고했어요!</div>")
    output_queue.push("<div class='chatbot_output'>혹시 궁금한 점이 아직 남아서 더 관련 정보를 찾고 싶으면 더 물어보세요!</div>")
    output_queue.push("<div class='chatbot_output'>마지막으로는 다음과 같은 이야기를 하고 있었어요</div>")
    output_queue.push("<div class='chatbot_output info' value="+cur_ev_id.toString()+">"+last_info+"</div>");
    clear_output_queue();
    attention_to_bottom();
    generate_question_infos(related_exist);
    //$("#chat_input_selector_margin").css("visibility", "hidden")
    //$("#return").css("visibility", "hidden")
  }
}

seems_related = function(recurrence, was_related){
  if(!was_related){
  var i = Math.floor((Math.random()*related_utterances.length));
  var output;
  if(recurrence){
    output = "전에 말했다시피 "
  }else{
    output = ""
  }
  output_queue.push("<div class='chatbot_output'>"+output+related_utterances[i]+"</div>")
  //$("#chat_display_container").append("<div class='chatbot_output'>"+output+related_utterances[i]+"</div>")
  }
}

dependency_update = function(){
  var new_ev_c_b_s=[];
  for(var i=0; i<dependent_events.length; i++){
    var pass=true;
    for(var j=0; j<dependent_events[i]['Dependent'].length; j++){
      if(!dealt_event_id_list.includes(dependent_events[i]['Dependent'][j])){
        pass=false;
      }
    }
    if(pass){
      events_can_be_seen.push(dependent_events[i]['Event_Id'])
    }else{
      new_ev_c_b_s.push(dependent_events[i])
    }
  }
  dependent_events=[]
  for(var i=0; i<new_ev_c_b_s.length; i++){
    dependent_events.push(new_ev_c_b_s[i])
  }
  console.log(dependent_events)
}

generate_question_infos = function(related_exist){
  $("#chat_input_selector").empty();
  $("#return").css('visibility', 'hidden');
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
  $("#chat_input_selector").append("<div class='ev_next chat_input_button'>말한 것 다음에는 어떤 일이 일어났죠?</div>")
  //관련된 / 다른 사건에 대해 알아보자
  if(related_exist){
  $("#chat_input_selector").append("<div class='related_ev chat_input_button'>그 관련된 사건이 뭔지 알 수 있을까요?</div>")
  }
  $("#chat_input_selector").append("<div class='other_ev chat_input_button'>(다른 사건을 중심으로 질문하기)</div>")
  console.log(figure_next_question);

  $(".chat_input_button").on("mouseover", function(){
    $(this).css('background-color', "#cccccc")
  }).on("mouseout", function(){
    $(this).css("background-color", "transparent")
  }).on("click", function(){
    var input = $(this).text();
    if(!$(this).attr("class").includes("other_ev")){
      $("#chat_display_container").append("<div class='user_input'>"+input+"</div>")
  }else{
      $("#chat_display_container").append("<div class='user_input'>말하고 있는 거 말고 전에 말했던 것 중에 더 이야기해보고 싶은게 있는데...(조수가 가져온 사건 기록 중 하나를 고르세요)</div>")
  }
    console.log($(this).attr("class"))
    if($(this).attr("class").includes("fig_who")){
      fig_who(parseInt($(this).attr('value')))
    }else if($(this).attr("class").includes("fig_next")){
      fig_next(parseInt($(this).attr('value')))
    }else if($(this).attr("class").includes("ev_what")){
      ev_what(parseInt($(this).attr('value')))
    }else if($(this).attr("class").includes("ev_next")){
      ev_next()
    }else if ($(this).attr("class").includes("other_ev")){
      $("#chat_input_selector").empty();
      $(".info").on("mouseover", function(){
        $(this).css("background-color", "black").css("color", "white")
      }).on("mouseout", function(){
        $(this).css("background-color", "#cccccc").css("color", "black")
      }).on("click", function(){
          cur_ev_id = parseInt($(this).attr("value"));
          retrieve_output(parseInt($(this).attr("value")), false)
          $(".info").off("click").off("mouseover").off("mouseout")
          .css("background-color", "#cccccc").css("color", "black")
      })

    }else if($(this).attr("class").includes("related_ev")){
      retrieve_output(related_id);
    }

    attention_to_bottom();
})

}
attention_to_bottom = function(){
  $('#chat_display_container').stop().animate({
    scrollTop: $('#chat_display_container')[0].scrollHeight
  }, 800);

}
multi_fig_returner=function(figures){
  var return_string = ""
  if(typeof figures == "string"){
    return figures
  }
  for(var i=0; i<figures.length; i++){
    return_string = return_string+figures[i];
    if(i!=figures.length-1){
      return_string = return_string+"와(과) "
    }
  }
  return return_string;
}

fig_who = function(val){
  $.ajax({
    url: '/chatbot/fig_who',
    data:{
      'figure': figure_who_question[val],
      'events_can_be_seen': JSON.stringify(events_can_be_seen),
    },
    dataType: 'json',
    success: function(data){
      var retrieved = data.retrieved;
      if(retrieved){
        cur_ev_id = data.Event_Id;
        console.log(multi_fig_returner(figure_who_question[val]))
        output_queue.push("<div class='chatbot_output'>"+multi_fig_returner(figure_who_question[val])+"에 대한 최초의 기록은 다음과 같아요.</div>")
        //$("#chat_display_container").append("<div class='chatbot_output'>"+multi_fig_returner(figure_who_question[val])+"에 대한 최초의 기록은 다음과 같아요.</div>")
        retrieve_output(cur_ev_id);
      }else{
        output_queue.push("<div class='chatbot_output'>이 인물에 대해 알 수 있는 것이 없네요.</div>")
        clear_output_queue();
        //$("#chat_display_container").append("<div class='chatbot_output'>이 인물에 대해 알 수 있는 것이 없네요.</div>")

      }
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
      'events_can_be_seen': JSON.stringify(events_can_be_seen),
    },
    dataType: 'json',
    success: function(data){
      var retrieved = data.retrieved;
      if(retrieved){
        cur_ev_id = data.Event_Id;
        output_queue.push("<div class='chatbot_output'>"+multi_fig_returner(figure_next_question[val])+"에 대한 다음 기록은 다음과 같아요.</div>")
        //$("#chat_display_container").append("<div class='chatbot_output'>"+multi_fig_returner(figure_next_question[val])+"에 대한 다음 기록은 다음과 같아요.</div>")
        retrieve_output(cur_ev_id);
      }else{
        output_queue.push("<div class='chatbot_output'>이 이후로 이 인물(들)에 대해 알 수 있는 것이 없네요.</div>")
        clear_output_queue()
        //$("#chat_display_container").append("<div class='chatbot_output'>이 이후로 이 인물(들)에 대해 알 수 있는 것이 없네요.</div>")

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
      'events_can_be_seen': JSON.stringify(events_can_be_seen),
    },
    dataType: 'json',
    success: function(data){
      var retrieved = data.retrieved;
      if(retrieved){
        cur_ev_id = data.Event_Id;
        output_queue.push("<div class='chatbot_output'>"+event_tag_list[val]+"와 관련된 최초의 기록은 다음과 같아요.</div>")
        //$("#chat_display_container").append("<div class='chatbot_output'>"+event_tag_list[val]+"와 관련된 최초의 기록은 다음과 같아요.</div>")
        retrieve_output(cur_ev_id);
      }else{
        output_queue.push("<div class='chatbot_output'>이 사건에 대해 알 수 있는 것이 없네요.</div>")
        clear_output_queue()
        //$("#chat_display_container").append("<div class='chatbot_output'>이 사건에 대해 알 수 있는 것이 없네요.</div>")

      }
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
      'events_can_be_seen': JSON.stringify(events_can_be_seen),
    },
    dataType: 'json',
    success: function(data){
      var retrieved = data.retrieved;
      if(retrieved){
        cur_ev_id = data.Event_Id;
        output_queue.push("<div class='chatbot_output'>이 이후로 이 사건과 관련 깊은 다음 기록은 다음과 같아요.</div>")
        //$("#chat_display_container").append("<div class='chatbot_output'>이 이후로 이 사건과 관련 깊은 다음 기록은 다음과 같아요.</div>")
        retrieve_output(cur_ev_id);
      }else{
        output_queue.push("<div class='chatbot_output'>이 이후로 이 사건과 관련 깊은 다음 기록을 찾을 수가 없네요.</div>")
        clear_output_queue()
        //$("#chat_display_container").append("<div class='chatbot_output'>이 이후로 이 사건과 관련 깊은 다음 기록을 찾을 수가 없네요.</div>")

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
clear_output_queue=function(){

  if(output_queue.length>0){
    $("#chat_input_selector").css("visibility", "hidden").css("pointer-events", "none");
    $("#return").css("pointer-events", "none");
    var output = output_queue.shift()
    var text;
    $(output).appendTo("#chat_display_container").css('opacity', function(){
      text = $(this).text()
      $(this).text("chatbot is typing...")
      return 0;
    }).animate({
      opacity: 1,
    }, 1000, function(){
      $(this).text(text)
      attention_to_bottom();
      clear_output_queue()
    })
  }else{
    $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
    $("#return").css("pointer-events", "auto");
  }
}

elements_fit_size = function(){
  var chatbot_input_height = $("#chat_input").height();
  var chatbot_display_height = $("#chat_display").height();
  $("#chat_input_container").height(chatbot_input_height-20);
  $("#chat_display_container").height(chatbot_display_height-20);
}
