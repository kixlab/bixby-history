
//make users answer the prompt
var initial_text;
var prompt_conditions;
var prompt_queue;
var prompt_ids;
var do_prompting = false;
var cur_prompting;
var chat_count=0;
var output_queue=[];
var cur_char, cur_char_id, cur_josa;
var final_remark;
var seen_events=[];
var question_events;
var total_figure_list;
var on_figure_button = [];
var cur_indx;
var final_node;
var end=false;
$(document).ready(function(){
  console.log(img_route)
  initialize();
  elements_fit_size();
  window.onresize = function(event){
    elements_fit_size();
  }

})
initialize = function(){
  curriculum_name = "test2"// prompt("curriculum name is ");
  console.log("het")
  $.ajax({
    url: '/chatbot/curriculum_retrieval',
    data:{
      'cur_name': curriculum_name,
    },
    dataType: 'json',
    success : function(data){
      //update question count
      total_figure_list = JSON.parse(data.all_figure_list)
      initial_text = data.init_text
      figure_list = JSON.parse(data.figure_list)
      final_remark = data.final_remark
      console.log(figure_list)
      for(var i=0; i<total_figure_list.length; i++){
        //assign question #
        total_figure_list[i]['total_questions']=0
        total_figure_list[i]['answered_questions']=0
        $("#chat_mid").append("<button id='figure_"+i.toString()+"' class='char_button btn btn-primary disabled' val='"+total_figure_list[i]['name']+"' style='display : none'><span id='figure_"+i.toString()+"_alert' class='badge-pill badge-danger' style='margin-right: 3px; display:none'>d</span><span id='figure_"+i.toString()+"_text' class='figure_text'>"+total_figure_list[i]['name']+"</span></button>")
        $("#figure_"+i.toString()).css("pointer-events", "none").on("click", function(){
          retrieve_possible_questions(this);

        })

      }
      console.log(total_figure_list)
      init_text = data.init_text.split("/n")
      final_node = data.answer_id;
      console.log(init_text)
      //$("#chat_below").append("<div class='chatbot_output'>"+init_text+"</div>")
      for(var i=0; i<init_text.length; i++){
        if(init_text[i].length>0){
          output_queue.push([init_text[i], "chatbot_output"])
        }
      }
      output_queue.push(["위의 인물 중 한 명을 선택하여 질문을 던져서 정보를 습득하세요.", "chatbot_instruction"])
      output_queue.push(["인물들에게 단서를 습득해나가면서 대화 가능한 인물과 더 물어볼 수 있는 질문의 수가 늘어납니다.", "chatbot_instruction"])
      output_queue.push(["인물 옆에 표시되는 숫자는 현재 인물에게서 더 물어볼 수 있는 질문의 갯수입니다.", "chatbot_instruction"])
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
  if(on_figure_button.length != 0){
    for(var k=0; k<on_figure_button.length; k++){
      $("#figure_"+on_figure_button[k].toString()).css("display","")
      $("#progress_indicator").before("<div class='chatbot_instruction'>"+"이제 "+$("#figure_"+on_figure_button[k].toString()).attr("val")+"에게도 질문을 할 수 있습니다!"+"</div>")

    }
    on_figure_button = [];
    //retrieve_possible_questions();
    //alert("이제 "+$("#figure_"+on_figure_button.toString()).attr("val")+"에게도 질문을 할 수 있습니다!")


    //return;
  }
  if(cur_char != $(t).attr("val")){
    cur_char = $(t).attr("val");
    cur_josa = Josa.c(cur_char,'과/와');
    cur_char_id = $(t).attr("id");
    $('.char_button').off('click').on('click', function(){
      if(this!=t){
        retrieve_possible_questions(this);
      }
    })
    $(".figure_text").text(function(){
      return $(this).parent().attr('val')
    })
    $("#"+$(t).attr("id")+"_text").text($(t).attr("val")+cur_josa+" 대화 중 입니다.")
    $(t).off("click")
    $("<div class='container char_begin' style='display:block; float: left; opacity: 0'>"+cur_char+cur_josa+" 대화를 시작합니다.</div>").insertBefore("#progress_indicator")
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
      var total_figure_event_counts= JSON.parse(data.total_figure_event_counts)
      console.log(total_figure_event_counts)
      for(var i=0; i<total_figure_list.length; i++){
        if(total_figure_list[i]['total_questions'] != total_figure_event_counts[total_figure_list[i]['name']]){
          if(total_figure_list[i]['total_questions']!=0 && $("#figure_"+i.toString()).css('display')!="none"){
            $("#progress_indicator").before("<div class='chatbot_instruction'>이제 "+total_figure_list[i]['name']+"에게 "+(total_figure_event_counts[total_figure_list[i]['name']]-total_figure_list[i]['total_questions']).toString()+"개의 질문을 더 할 수 있습니다."+"</div>")//alert(total_figure_list[i]['name']+"에게 "+(total_figure_event_counts[total_figure_list[i]['name']]-total_figure_list[i]['total_questions']).toString()+"개의 질문을 더 할 수 있습니다.");
          }
          total_figure_list[i]['total_questions'] = total_figure_event_counts[total_figure_list[i]['name']];
          //push alert

        }
        var cur_count = total_figure_list[i]['total_questions']-total_figure_list[i]['answered_questions']
        if(cur_count!=0){
          $("#figure_"+i.toString()+"_alert").css('display',"").text(cur_count.toString())
        }else{
          $("#figure_"+i.toString()+"_alert").css('display', "none").text("")
        }
      }
      console.log(total_figure_list)
      question_events = JSON.parse(data.possible_events);
      console.log(question_events)
      for(var i=0; i<question_events.length; i++){
        $("<button class='btn btn-large btn-info question_btn activated input_button' val='"+i.toString()+"' style='float: left; opacity: 0'>"+question_events[i]['event_question']+"</button>")
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
              var cur_char_id_num = parseInt(cur_char_id.substr(7))
              $(this).off('click')
              $(this).animate({opacity:0}, 500, function(){
                $(this).remove()
              })
              cur_indx = parseInt($(this).attr('val'));
              var ev_hp = question_events[cur_indx]['event_happen'].split("/n")
              var ids = []
              on_figure_button = []
              for (var j=0; j<total_figure_list.length; j++){
                if(question_events[cur_indx]['event_happen'].includes(total_figure_list[j]['name'])&&$("#figure_"+j.toString()).css("display")=="none"){
                  //$("#figure_"+j.toString()).css("display","")
                  on_figure_button.push(j);
                  console.log(on_figure_button)
                  //$("#chat_mid").append("<button id='figure_"+i.toString()+"' class='char_button btn btn-primary disabled' val='"+figure_list[i]+"'>"+figure_list[i]+"</button>")
                }
              }

              output_queue.push([question_events[cur_indx]['event_question'], "user_input"])
              for(var j=0; j<ev_hp.length; j++){
                output_queue.push([ev_hp[j],"chatbot_output"])
              }
              //save for alarm number
              if(!seen_events.includes(question_events[cur_indx]['event_id'])){
                console.log(cur_char_id)
                var q_count = parseInt($("#figure_"+cur_char_id_num.toString()+"_alert").text())
                $("#figure_"+cur_char_id_num.toString()+"_alert").text((q_count-1).toString())

                console.log(cur_char_id_num)
                total_figure_list[cur_char_id_num]['answered_questions']++;
              }
              seen_events.push(question_events[cur_indx]['event_id'])
              clear_output_queue();
            })
          }
        })

      }
      $(".btn-light").appendTo("#chat_input_selector")

    },
    error: function(data){

    }
  })
}


do_prompt = function(not_end=true){
  var cur_prompt = question_events[cur_indx]['prompt1'].split('/q')
  $("#return").css("pointer-events", "auto");

  $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"'>"+cur_prompt[0]+"</div>")
  $("#below_"+chat_count.toString()).css("opacity","0").animate({opacity:1}, 500, function(){
    chat_count++;
    $(this).append("<button id='dunno_"+chat_count.toString()+"' class='btn btn-sm dunno'>잘 모르겠나요?</button>")
    $("#dunno_"+chat_count.toString()).on('click', function(){
      $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"'>"+cur_prompt[1]+"</div>")
      $(this).off('click').addClass("disabled")
      attention_to_bottom();
      chat_count++;
    })
    //$('[data-toggle="tooltip"]').tooltip();
    $("#chat_input_selector").empty();
    $("#chat_input_selector").append("<textarea id='prompt_input'></textarea>")
    $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
    $("#prompt_input").focus().outerHeight($("#chat_input_selector_margin").height()).outerWidth($("#chat_input_selector_margin").width())
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
  $(".dunno").addClass('disabled').off('click')
  var u_input = $("#prompt_input").val()
  $("#prompt_input").val('').empty().focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+u_input+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text(u_input)
    $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
    attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      console.log(chat_count)
      var cur_prompt = question_events[cur_indx]['prompt2'].split('/q')
      $(this).text(cur_prompt[0])
      $(this).append("<button id='dunno_"+chat_count.toString()+"' class='btn btn-sm dunno'>잘 모르겠나요?</button>")
      $("#dunno_"+chat_count.toString()).on('click', function(){
        $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"'>"+cur_prompt[1]+"</div>")
        $(this).off('click').addClass("disabled")
        chat_count++;
        attention_to_bottom();
      })

      chat_count = chat_count+1;

      if(!question_events[cur_indx]['prompt2'].includes("제 의견에 대해서는 어떻게 생각하시나요?")){
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
    }else{
      agreement();
    }
    })
  })
}

agreement = function(){
  $("#return").off("click")
  $("#prompt_input").off("keydown")
  $("#chat_input_selector").empty().append("<button id='agree' class='btn btn-large btn-info'>동의해요</button>")
  .append("<button id='disagree' class='btn btn-large btn-info'>생각이 다른 것 같아요</button>")
  $("#agree").on('click',function(){
    disagreement();
  })
  $("#disagree").on('click', function(){
    $("#chat_input_selector").empty().append("<textarea id='prompt_input'></textarea>")
    $("#prompt_input").focus().outerHeight($("#chat_input_selector").height()).outerWidth($("#chat_input_selector").width())
    do_prompt_third();
    $(this).remove();
  })
}

disagreement = function(){
  $("#prompt_input").val('').focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+"동의해요."+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text("동의해요.")
    if(final_node!=question_events[cur_indx]['event_id']){
      $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
      attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      chat_count = chat_count+1;

        $(this).text("생각을 이야기해줘서 고마워요. 이제 다시 역사 인물들과 이야기 해 봅시다.")
        $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
        $("#return").css("pointer-events", "auto");
        $(".char_button").removeClass("disabled").addClass("activated").css("pointer-events", "auto");
        retrieve_possible_questions("#"+cur_char_id)
    })
  }
})
}

do_prompt_third = function(not_end=true){
  $(".dunno").off("click").addClass("disabled")
  var u_input = $("#prompt_input").val()
  $("#prompt_input").val('').focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+u_input+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text(u_input)
    $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
    attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      chat_count = chat_count+1;
      $(this).text("왜 그렇게 생각하세요? 이유를 듣고 싶어요!")
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
  $(".dunno").off("click").addClass("disabled")
  var u_input = $("#prompt_input").val()
  $("#prompt_input").val('').focus()
  $("#return").off("click")
  $("#prompt_input").off("click")
  $("#progress_indicator").before("<div class='user_input' id='below_"+chat_count.toString()+"' val='"+u_input+"'' style='opacity: 0'>sending your input...</div>")
  attention_to_bottom();
  $("#below_"+chat_count.toString()).animate({opacity:1},500,function(){
    chat_count = chat_count+1;
    $(this).text(u_input)
    if(final_node!=question_events[cur_indx]['event_id']){
      $("#progress_indicator").before("<div class='helper_name'>챗봇 선생님</div>").before("<div class='chatbot_instruction' id='below_"+chat_count.toString()+"' style='opacity:0'>chatbot is typing...</div>")
      attention_to_bottom();
    $("#below_"+chat_count.toString()).animate({opacity:1}, 500, function(){
      chat_count = chat_count+1;

        $(this).text("생각을 이야기해줘서 고마워요. 이제 다시 역사 인물들과 이야기 해 봅시다.")
        $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
        $("#return").css("pointer-events", "auto");
        $(".char_button").removeClass("disabled").addClass("activated").css("pointer-events", "auto");
        retrieve_possible_questions("#"+cur_char_id)
    })
  }else{
    end= true;
    prompt_queue = []
    //var final_remark = "그렇게 생각하시는군요./n 어쨌든 직접적인 이유를 찾은 것 같군요!/n"+"결국 정몽주는 이성계와 이방원의 새 나라를 건국하려는 계획에 반대했기 때문에 죽임을 당한 거였어요/n"+" 이 사건과 사건이 일어난 배경에 대해서 잘 파악이 되셨으면 좋겠어요./n 그리고 여기서 재현된 대화 또한 사건들에 대한 하나의 해석이라는 사실을 꼭 명심하세요!"
    final_remark = final_remark.split("/n")
    cur_char_id = null;
    cur_char = null;
    output_queue=[]
    for(var j=0; j<final_remark.length; j++){
      if(final_remark[j].length>2){
        console.log(final_remark[j])
      output_queue.push([final_remark[j], "chatbot_instruction"])
    }
    }
    clear_output_queue();
  }

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
  }, 500);

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
      $("#progress_indicator").before("<div style='width: 100%; float: left'>"+cur_char+"</div>")

    }else if(output[1]=="chatbot_instruction"){
      $("#progress_indicator").before("<div style='width: 100%; float: left'>챗봇 선생님</div>")
    }
    var cur_char_img_id = img_id(cur_char);
    $("#progress_indicator").before("<div style='width:100%; margin-bottom:10px;'><div class='"+output[1]+"' id='below_"+chat_count.toString()+"'>"+output[0]+"</div></div>")
    if(output[1]!='user_input'){
      $("#below_"+chat_count.toString()).before("<img class='pic' val='' src='"+img_route+"/"+cur_char_img_id.toString()+".png'></img>")
    }
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
    }, 500, function(){
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
        if(output[1]=='user_input'){
          $("#progress_indicator").off("click")
          $("body").off("keydown")
          chat_count = chat_count+1;
          clear_output_queue()
        }else{
          $("#progress_indicator").off("click").on("click", function(){
              $(this).off("click")
              $("body").off("keydown")
              chat_count = chat_count+1;
              clear_output_queue()

          })
        }
      }else{
        chat_count = chat_count+1;

        $("#progress_indicator").off("click").animate({
          opacity: 0,
        }, 500)
        console.log(question_events)
        if(question_events == null){
          $("#chat_input_selector").css("visibility", "visible").css("pointer-events", "auto");
          $("#return").css("pointer-events", "auto");
          $(".char_button").removeClass("disabled").addClass("activated").css("pointer-events", "auto");
        }else if(!end&&("prompt1" in question_events[cur_indx])&&(count_list(seen_events, question_events[cur_indx]['event_id'])==1)){
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
    if(output[0]=="인물 옆에 표시되는 숫자는 현재 인물에게서 더 물어볼 수 있는 질문의 갯수입니다."){
      $("#chat_mid").tooltip().tooltip('show')
      for(var i=0; i<total_figure_list.length; i++){
        if(initial_text.includes(total_figure_list[i]['name'])){
          $("#figure_"+i.toString()).css("display", "");
        }
      }
    }
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
img_id=function(char){
  for(var i=0; i<total_figure_list.length; i++){
    if(char==total_figure_list[i]['name']){
      return total_figure_list[i]['id']
    }
  }
  return -1;
}
elements_fit_size = function(){
  var chatbot_input_height = $("#chat_input").height();
  var chatbot_display_height = $("#chat_display").height();
  $("#chat_input_container").height(chatbot_input_height-20);
  $("#chat_below").height((chatbot_display_height-40)*0.85);
//  $("#chat_above").height((chatbot_display_height-60)*0.2);
  $("#chat_mid").height((chatbot_display_height-40)*0.15)
}
