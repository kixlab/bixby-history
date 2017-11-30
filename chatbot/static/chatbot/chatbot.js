
//make users answer the prompt
var prompt_conditions;
var prompt_queue;
var prompt_ids;
var do_prompting = false;
var cur_prompting;
var chat_count=0;
var output_queue=[];
var cur_char, cur_char_id;
var seen_events=[];
var question_events;
var total_figure_list;
var on_figure_button = null;
var cur_indx;
var final_node;
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
      total_figure_list = JSON.parse(data.all_figure_list)
      console.log(total_figure_list)
      figure_list = JSON.parse(data.figure_list)
      console.log(figure_list)
      for(var i=0; i<total_figure_list.length; i++){

        $("#chat_mid").append("<button id='figure_"+i.toString()+"' class='char_button btn btn-primary disabled' val='"+total_figure_list[i]+"'>"+total_figure_list[i]+"</button>")
        $("#figure_"+i.toString()).css("pointer-events", "none").on("click", function(){
          retrieve_possible_questions(this);

        })
        if(!data.init_text.includes(total_figure_list[i])){
          $("#figure_"+i.toString()).css("display", "none");
        }
      }
      init_text = data.init_text.split("/n")
      final_node = data.answer_id;
      console.log(init_text)
      //$("#chat_below").append("<div class='chatbot_output'>"+init_text+"</div>")
      for(var i=0; i<init_text.length; i++){
        if(init_text[i].length>0){
          output_queue.push([init_text[i], "chatbot_output"])
        }
      }
      output_queue.push(["위의 인물 중 한 명을 선택하여 질문을 던져서 정보를 습득하세요", "chatbot_instruction"])
      clear_output_queue();
      //retrieve_output(init_ev_id);

//      console.log(events_can_be_seen)
//      console.log(dependent_events)
      console.log(prompt_conditions)
    },
    error : function(data){

    }
  })

}
retrieve_possible_questions = function(t){
  //add char_button
  if(on_figure_button != null){
    console.log(on_figure_button)
    $("#figure_"+on_figure_button.toString()).css("display","")
    alert("이제 "+$("#figure_"+on_figure_button.toString()).attr("val")+"에게도 질문을 할 수 있습니다!")
    on_figure_button = null;

  }
  if(cur_char != $(t).attr("val")){
    cur_char = $(t).attr("val");
    cur_char_id = $(t).attr("id");
    $('.char_button').off('click').on('click', function(){
      if(this!=t){
        retrieve_possible_questions(this);
      }
    }).text(function(){
      return $(this).attr("val")
    })
    $(t).text($(t).attr("val")+"(와)과 대화 중 입니다.").off("click")
    $("<div class='container char_begin' style='display:block; float: left; opacity: 0'>"+cur_char+"와(과) 대화를 시작합니다.</div>").insertBefore("#progress_indicator")
    .animate({
      opacity: 1
    }, 500, function(){
      retrieve_q_from_server();
    })
    attention_to_bottom()
  }else{
    retrieve_q_from_server();
  }
  $("#chat_input_selector").empty();


}

retrieve_q_from_server=function(){
  $.ajax({
    url: '/chatbot/retrieve_possible_questions',
    data:{
      'cur_char': cur_char,
      'seen_events': JSON.stringify(seen_events),
    },
    dataType: 'json',
    success : function(data){
      question_events = JSON.parse(data.possible_events);
      console.log(question_events)
      for(var i=0; i<question_events.length; i++){
        $("<button class='btn btn-large btn-info question_btn activated' val='"+i.toString()+"' style='float: left; opacity: 0'>"+question_events[i]['event_question']+"</button>")
        .appendTo("#chat_input_selector")
        .animate({opacity:1},{
          duration: 500,
          start: function(){
            if(seen_events.includes(question_events[i]['event_id'])){
              $(this).removeClass("btn-info").addClass("btn-light").css("color", "#dddddd")
            }
          },
          done : function(){
            $(this).on('click', function(){
              $(this).off('click')
              $(this).animate({opacity:0}, 500, function(){
                $(this).remove()
              })
              cur_indx = parseInt($(this).attr('val'));
              var ev_hp = question_events[cur_indx]['event_happen'].split("/n")
              var ids = []
              for (var j=0; j<total_figure_list.length; j++){
                if(question_events[cur_indx]['event_happen'].includes(total_figure_list[j])&&$("#figure_"+j.toString()).css("display")=="none"){
                  //$("#figure_"+j.toString()).css("display","")
                  on_figure_button = j;
                  console.log(on_figure_button)
                  //$("#chat_mid").append("<button id='figure_"+i.toString()+"' class='char_button btn btn-primary disabled' val='"+figure_list[i]+"'>"+figure_list[i]+"</button>")
                }
              }
              output_queue.push([question_events[cur_indx]['event_question'], "user_input"])
              for(var j=0; j<ev_hp.length; j++){
                output_queue.push([ev_hp[j],"chatbot_output"])
              }
              seen_events.push(question_events[cur_indx]['event_id'])
              clear_output_queue();
            })
          }
        })

      }
    },
    error: function(data){

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

  $("#return").css("pointer-events", "auto");

  $("#progress_indicator").before("<div class='helper_name'>TA</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"'>"+question_events[cur_indx]['prompt1']+"</div>")
  $("#below_"+chat_count.toString()).css("opacity","0").animate({opacity:1}, 500, function(){
    chat_count++;
    $("#chat_input_selector").empty();
    $("#chat_input_selector").append("<textarea id='prompt_input'></textarea>")
    $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
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
  })
  //$("#chat_display_container").append("<div class='chatbot_output'>"+cur_prompting['question']+"</div>")
  //clear input, leave text area


}

do_prompt_second = function(){
  //output
  var u_input = $("#prompt_input").val()
  $("#prompt_input").val('').empty().focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+u_input+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text(u_input)
    $("#progress_indicator").before("<div class='helper_name'>TA</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
    attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      chat_count = chat_count+1;
      $(this).text(question_events[cur_indx]['prompt2'])
      $("#prompt_input").off("keydown").on('keydown', function(event){
      if(event.keyCode==13){
        $(this).off('keydown')
        $("#return").off("click")
        do_prompt_third();
      }
      })
      $("#return").off("click").on("click", function(){
        $("#prompt_input").off("click")
        $(this).off('click')
        do_prompt_third();
      })

    })

  })

  //$("#prompt_input");




}

do_prompt_third = function(not_end=true){

  var u_input = $("#prompt_input").val()
  $("#prompt_input").val('').focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+u_input+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text(u_input)
    $("#progress_indicator").before("<div class='helper_name'>TA</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
    attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      chat_count = chat_count+1;
      $(this).text("왜 그렇게 생각하세요? 그렇게 생각하는 논리적 증거나 그렇게 생각하게 한 정황 같은 것이 있나요?")
      $("#prompt_input").off("keydown").on('keydown', function(event){
      if(event.keyCode==13){
        $(this).off('keydown')
        $("#return").off("click")
        do_prompt_fourth();
      }
      })
      $("#return").off("click").on("click", function(){
        $("#prompt_input").off("click")
        $(this).off('click')
        do_prompt_fourth();
      })

    })

  })
}

do_prompt_fourth = function(not_end = true){
  var u_input = $("#prompt_input").val()
  $("#prompt_input").val('').focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+u_input+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text(u_input)
    $("#progress_indicator").before("<div class='helper_name'>TA</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
    attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      chat_count = chat_count+1;
      if(final_node != question_events[cur_indx]['event_id']){
        $(this).text("생각을 이야기해줘서 고마워요. 이제 다시 "+cur_char+"과(와) 이야기 해 봅시다.")
        $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
        $("#return").css("pointer-events", "auto");
        $(".char_button").removeClass("disabled").addClass("activated").css("pointer-events", "auto");
        retrieve_possible_questions("#"+cur_char_id)
      }else{
        $(this).text("그렇게 생각하시는군요. 어쨌든 직접적인 이유를 찾은 것 같군요! 이 사건과 사건이 일어난 배경에 대해서 잘 파악이 되셨으면 좋겠어요. 그리고 여기서 재현된 대화 또한 사건들에 대한 하나의 해석이라는 사실을 꼭 명심하세요!")
        
      }


    })

  })

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

attention_to_bottom = function(){
  console.log($("#chat_below").scrollHeight)
  $('#chat_below').stop().animate({
    scrollTop: $('#chat_below').prop('scrollHeight')
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
    $(".char_button").css("pointer-events", "none").removeClass("activated").addClass("disabled");
    $("#progress_indicator").css("opacity", "1").text("Next")
    $("#chat_input_selector").css("visibility", "hidden").css("pointer-events", "none");
    var output = output_queue.shift()
    var text;
    $("#return").css("pointer-events", "none");
    if(cur_char != null && output[1]!='user_input'){
      $("#progress_indicator").before("<div style='width: 80%; float: left'>"+cur_char+"</div>")

    }else if(output[1]=="chatbot_instruction"){
      $("#progress_indicator").before("<div style='width: 80%; float: left'>TA</div>")
    }
    $("#progress_indicator").before("<div class='"+output[1]+"' id='below_"+chat_count.toString()+"'>"+output[0]+"</div>")
    $("#below_"+chat_count.toString()).css('opacity', function(){
      text = $(this).text()
      if(output[1]!='user_input'){
      $(this).text("chatbot is typing...")
    }else{
      $(this).text("sending your input...")
    }
      return 0;
    }).animate({
      opacity: 1,
    }, 1000, function(){
      $(this).text(text)
      attention_to_bottom();
      /*$("body").off("keydown").on('keydown', function(){
        if(event.keyCode==13){
          $(this).off("click")
          $("body").off("keydown")
          chat_count = chat_count+1;
          clear_output_queue()
        }
      })*/
      if(output_queue.length !=0){
      $("#progress_indicator").off("click").on("click", function(){
          $(this).off("click")
          $("body").off("keydown")
          chat_count = chat_count+1;
          clear_output_queue()

      })}else{
        chat_count = chat_count+1;

        $("#progress_indicator").off("click").animate({
          opacity: 0,
        }, 500)
        console.log(question_events)
        if(question_events == null){
          $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
          $("#return").css("pointer-events", "auto");
          $(".char_button").removeClass("disabled").addClass("activated").css("pointer-events", "auto");
        }else if(("prompt1" in question_events[cur_indx])&&(count_list(seen_events, question_events[cur_indx]['event_id'])==1)){
          do_prompt();
          return;
        }else {
          $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
          $("#return").css("pointer-events", "auto");
          $(".char_button").removeClass("disabled").addClass("activated").css("pointer-events", "auto");
        }
        if(cur_char_id!=null){
          retrieve_possible_questions("#"+cur_char_id);
        }
      }
    })
  }else{
    //$("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
    //$("#return").css("pointer-events", "auto");

    $("#progress_indicator").css("display", "none")
  }
}
count_list = function(list, element){
  var count=0;
  for(var k=0; k<list.length; k++){
    if(list[k]==element){
      count++;
    }
  }
  return count;
}
elements_fit_size = function(){
  var chatbot_input_height = $("#chat_input").height();
  var chatbot_display_height = $("#chat_display").height();
  $("#chat_input_container").height(chatbot_input_height-20);
  $("#chat_below").height((chatbot_display_height-40)*0.85);
//  $("#chat_above").height((chatbot_display_height-60)*0.2);
  $("#chat_mid").height((chatbot_display_height-40)*0.15)
}
