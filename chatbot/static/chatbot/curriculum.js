var figure_keywords =[];
var all_figure_keywords;
var event_keywords = [];
var all_event_keywords;

var events;
var cur_event_figures;
var cur_event_tags;
var cur_event_descriptions;
var cur_event_ids;

var selected=[]
var selected_ids = [];

var start_event_id=-1;
var start_index;
var cause_event_id
var cur_queue_pos=0;
var dependency_queue=[];
$(document).ready(function(){
  retrieve_figures_events();
  retrieve_timeline();
  $("#next").on("click", function(){
    selected = [];
    var seq = 0;
    $("#search_panel").css("visibility", "hidden");
    $(".tl_element").off("click");
    for(var i=0; i<events.length; i++){
      if(!selected_ids.includes(events[i]['id'])){
        $("#"+i.toString()).remove();
      }else{
        var sel={};
        $("#"+i.toString()).attr("value",seq)
        sel['id'] = events[parseInt($("#"+i.toString()).attr("id"))]['id']
        sel['dependency'] = [];
        selected.push(sel);
        seq++;
      }
    }
    console.log(selected)
    console.log(events)
    $(".tl_element").css("color", "grey").attr("id", function(){
      return events[parseInt($(this).attr("id"))]['id']})
      .on("click", function(){
        if(start_event_id>=0){
        $("#"+start_event_id.toString()).css("color", "grey")
        }
        start_event_id = parseInt($(this).attr("id"));
        start_index = parseInt($(this).attr("value"));
        $("#"+start_event_id.toString()).css("color", "white")
        console.log(start_event_id, start_index);
      });

    $("#prompt").text("커리큘럼에서 학생들이 원인을 규명해야 하는 사건을 선택해주세요")
    $(this).off("click").on("click", function(){

      if(start_event_id!=-1){
        $("#prompt").text("사건 간의 인과관계를 표시하여 주세요")
        $(".tl_element").off("click")
        var dependency = {}
        dependency['index']=start_index;
        dependency['depth']=0;
        dependency_queue.push(dependency);

        recursive_dependency_tagging();
      $(this).off("click").on("click", function(){
        cur_queue_pos++;
        if(cur_queue_pos!=dependency_queue.length){
          $("#prompt").text("붉게 하이라이트 된 사건에 접근하기 전에 꼭 봐야하는 사건을 선택해주세요. 해당하는 사건이 없으면 선택하지 않으셔도 됩니다.")
          recursive_dependency_tagging();
      }else{
        $(this).off("click");
        var cur_name = prompt("커리큘럼이 저장됩니다. 커리큘럼 이름을 입력해주세요");
        send_curriculum(cur_name);
      }
      })

    }else{
      alert("사건 하나는 선택하십시오")
    }
    })
  })
})

recursive_dependency_tagging=function(){
  $(".tl_element").css("visibility", function(){
    var index = parseInt($(this).attr("value"))
    for(var i=0; i<cur_queue_pos+1; i++){
      if(dependency_queue[i]['index']==index){
        $(this).off("mouseover").off("mouseout").off("click")
        if(index == dependency_queue[cur_queue_pos]['index']){
          $(this).css("background-color", "#d14272");
        }else{
          $(this).css("background-color", "#d8890a");
        }

        return "visible";
      }
    }
    $(this).off("click").on("click", function(){
      on_dependency(this)
    })
    return "visible";
  })
}

on_dependency = function(t){

  if(cur_queue_pos==0 && dependency_queue.length==2){
    dependency_queue.splice(1,1);
    $(".tl_element").css("color", function(){
        if(parseInt($(this).attr("value"))!=start_index){
          $(this).off("click").on("click", function(){
            on_dependency(this)
          })
          return "grey";
        }else{
          return "white";
        }
    });
  }
  $(t).css("color", "#cccccc")
  var index = dependency_queue[cur_queue_pos]['index']
  selected[index]['dependency'].push(parseInt($(t).attr("id")))
  var pass= true;
  for(var i=0; i<dependency_queue.length; i++){
    if(dependency_queue[i]['index']== parseInt($(t).attr("value"))){
      pass=false;
    }
  }
  if(pass){
  var dependency = {}
    dependency['index']=parseInt($(t).attr("value"));
    dependency['depth']=dependency_queue[cur_queue_pos]['depth']+1;
    dependency_queue.push(dependency)
  }
  $(t).off("click").on("click", function(){
    off_dependency(this)
  })
  console.log(dependency_queue);
}
off_dependency = function(t){
  $(t).css("color", "grey")
  var index = dependency_queue[cur_queue_pos]['index']
  var index_of_dep = selected[index]['dependency'].indexOf(parseInt($(t).attr("id")))
  selected[index]['dependency'].splice(index_of_dep, 1);
  console.log(selected[index]['dependency'])
  var dependency = {}
  for(var i=0; i<dependency_queue.length; i++){
    if(dependency_queue[i]['index']== parseInt($(t).attr("value"))){
      dependency_queue.splice(i, 1)
      break;
    }
  }
  console.log(dependency_queue);
  $(t).off("click").on("click", function(){
    on_dependency(this)
  })
}

send_curriculum=function(cur_name){
  console.log(selected);
  console.log(start_index);
  $.ajax({
    url: '/chatbot/curriculum_save',
    data:{
      'name': cur_name,
      'selected' : JSON.stringify(selected),
      'start_event_id': start_event_id,
    },
    dataType: 'json',
    success: function(data){

    },
    error: function(data){

    }
  })
}

retrieve_figures_events = function(){
  $.ajax({
    url: '/chatbot/get_all_figures',
    data: {
    },
    dataType:'json',
    success: function(data){
      all_figure_keywords = JSON.parse(data.figure_list)
      all_event_keywords = JSON.parse(data.event_list)
      console.log(all_figure_keywords)
      console.log(all_event_keywords)
      $("#figure_search_input").autocomplete({
        source: all_figure_keywords
      })
      $("#event_search_input").autocomplete({
        source: all_event_keywords
      })

      $("#figure_search_button").on("click", function(){
        var curinput = $("#figure_search_input").val()
        $("#figure_search_input").val("");
        console.log(curinput);
        if(all_figure_keywords.includes(curinput)&& $("#"+curinput.replace(/\s/gi, "_")).length==0){
          console.log("inside")
          figure_keywords.push(curinput)
          retrieve_timeline();
          $("#figure_entries").append("<div id="+curinput.replace(/\s/gi, "_")+" class='entity'>"+curinput+"</div>");

          $("#"+curinput.replace(/\s/gi, "_")).append("<button id="+curinput.replace(/\s/gi, "_")+"_del"+" class='del_but'>Del</button>")
          .on("mouseover", function(){
            var curid = $(this).attr("id").replace(/_/gi, " ");
            for(var i=0; i<events.length; i++){
              if(events[i]['figures'].includes(curid)){
                $("#"+i.toString()).css("background-color", "#cccccc")
              }
            }
          }).on("mouseout", function(){
            var curid = $(this).attr("id").replace(/_/gi, " ");
            for(var i=0; i<events.length; i++){
              if(events[i]['figures'].includes(curid)){
                if(!selected_ids.includes(events[i]['id'])){
                $("#"+i.toString()).css("background-color", "transparent")
              }else{
                $("#"+i.toString()).css("background-color", "black")
              }
            }
            }
          })

          $("#"+curinput.replace(/\s/gi, "_")+"_del").on("click", function(){
            var curid = $(this).attr("id");
            curid= curid.substr(0, curid.length-4);
            $("#"+curid).remove();
            var curname = curid.replace(/_/gi, " ");
            var ind = figure_keywords.indexOf(curname)
            figure_keywords.splice(ind, 1);
            retrieve_timeline();
            console.log(curid)
          })
        }else{
          console.log("not_inside")
        }
      })
      $("#event_search_button").on("click", function(){
        var curinput = $("#event_search_input").val()
        $("#event_search_input").val("");
        console.log(curinput);
        if(all_event_keywords.includes(curinput) && $("#"+curinput.replace(/\s/gi, "_")).length==0){
          console.log("inside")
          event_keywords.push(curinput)
          retrieve_timeline();
          $("#event_entries").append("<div id="+curinput.replace(/\s/gi, "_")+" class='entity'>"+curinput+"</div>");
          $("#"+curinput.replace(/\s/gi, "_")).append("<button id="+curinput.replace(/\s/gi, "_")+"_del"+" class='del_but'>Del</button>")
          .on("mouseover", function(){
            var curid = $(this).attr("id").replace(/_/gi, " ");
            for(var i=0; i<events.length; i++){
              if(events[i]['tags'].includes(curid)){
                $("#"+i.toString()).css("background-color", "#cccccc")
              }
            }
          }).on("mouseout", function(){
            var curid = $(this).attr("id").replace(/_/gi, " ");
            for(var i=0; i<events.length; i++){
              if(events[i]['tags'].includes(curid)){
                if(!selected_ids.includes(events[i]['id'])){
                $("#"+i.toString()).css("background-color", "transparent")
              }else{
                $("#"+i.toString()).css("background-color", "black")
              }
              }
            }
          })
          $("#"+curinput.replace(/\s/gi, "_")+"_del").on("click", function(){
            var curid = $(this).attr("id");
            curid= curid.substr(0, curid.length-4);
            $("#"+curid).remove();
            var curname = curid.replace(/_/gi, " ");
            var ind = event_keywords.indexOf(curname)
            event_keywords.splice(ind, 1);
            retrieve_timeline();
            console.log(curid)
          })
        }else{
          console.log("not_inside")
        }
      })
    },
    error: function(data){

    }
  })
}

retrieve_timeline = function(){
  selected_ids=[]
  for(var i=0; i<selected.length; i++){
    selected_ids.push(selected[i]['id'])
  }
  console.log(selected_ids)
  $.ajax({
    url: '/chatbot/retrieve_timeline',
    data: {
      'selected_ids': JSON.stringify(selected_ids),
      'figure_keywords': JSON.stringify(figure_keywords),
      'event_keywords': JSON.stringify(event_keywords),
    },
    dataType:'json',
    success: function(data){
      $("#time_line_container").empty();
      events = JSON.parse(data.events)
      events = events.concat()
      for(var i=0; i<events.length; i++){

        $("#time_line_container").append("<div class='tl_element' id="+i.toString()+">"+events[i]['description']+"</div>")
        $("#"+i.toString()).css("background-color", function(){
          if(selected_ids.includes(events[parseInt($(this).attr("id"))]['id'])){
            $(this).css("color", "white");
            return "black";
          }else{
            return "transparent";
          }
        }).on("mouseover", function(){

          $(this).css("background-color", "#cccccc")
        }).on("mouseout", function(){
          $(this).css("background-color", function(){
          if(selected_ids.includes(events[parseInt($(this).attr("id"))]['id'])){
            return "black"
          }else{
            return "transparent"
          }
          })
        }).on("click", function(){
          if(selected_ids.includes(events[parseInt($(this).attr("id"))]['id'])){
            elementunselect(this)
        }else{
          elementselect(this)
        }
        })
      }
    },
    error: function(data){

    }
  })
}
elementselect=function(t){
  var id = parseInt($(t).attr("id"));
  selected.push(events[id])
  console.log(selected)
  selected_ids.push(events[id]['id']);
  $(t).css("background-color", "black").css("color", "white")
  .off("mouseout").on("mouseout", function(){ $(this).css("background-color", "black")})
  .off("click").on("click", function(){elementunselect(t)})
}
elementunselect=function(t){
  var id = parseInt($(t).attr("id"));
  var sel_ind = selected.indexOf(events[id])
  selected.splice(sel_ind, 1);
  sel_ind = selected_ids.indexOf(events[id]['id'])
  selected_ids.splice(sel_ind,1);
  console.log(selected)
  $(t).css("background-color", "transparent").css("color", "black")
  .off("mouseout").on("mouseout", function(){ $(this).css("background-color", "transparent")})
  .off("click").on("click", function(){elementselect(t)})
}
