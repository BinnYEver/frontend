const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
const optionsList = document.querySelectorAll(".option");
const add_search = document.querySelector(".add_entity");
const min_search = document.querySelector(".min_entity");
const parent_entity_pair = document.querySelector(".entity_pair");
const submit_but = document.querySelector('.submit_but');
// let audio_sound = document.querySelectorAll("audio");

// build an 20 * 3 array of 0
var check_states = new Array(20);
for (var i = 0; i < check_states.length; i++) {
    check_states[i] = new Array(3);
    for (var j = 0; j < check_states[i].length; j++) {
        check_states[i][j] = 0;
    }
}
function update_choice(i, j, but_list) {
    check_states[i][0] = 0;
    check_states[i][1] = 0;
    check_states[i][2] = 0;
    but_list[i * 3].setAttribute("class", "check but");
    but_list[i * 3 + 1].setAttribute("class", "wrong but");
    but_list[i * 3 + 2].setAttribute("class", "notknown but");
    if(j == 0) {
        check_states[i][0] = 1;
        but_list[i * 3].setAttribute("class", "check_chosen but");
    }
    else if(j == 1) {
        check_states[i][1] = 1;
        but_list[i * 3 + 1].setAttribute("class", "wrong_chosen but");
    }
    else if(j == 2) {
        check_states[i][2] = 1;
        but_list[i * 3 + 2].setAttribute("class", "notknown_chosen but");
    }

    
    console.log(check_states);
}


var funDownload = function (content, filename) {
    // create hidden download link
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // convert content to blob address
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // click
    document.body.appendChild(eleLink);
    eleLink.click();
    // remove
    document.body.removeChild(eleLink);
};
/*
function create_visit_id() {
    var cur_url = window.location.href;
    try {
        response_visit_id = $.getJSON(cur_url.replace("resultER", "create_visit_id"), function () {
            console.log("sent get_visit_id");
        });
        response_visit_id.done(function (data) {
            console.log("success from get_visit_id");
            console.log(response_visit_id.responseJSON)
            // console.log(jqxhr.responseJSON);
            var status = response_visit_id.responseJSON['success'];
            if (status != true) {
                alert("Error: " + status);
                window.location.href = "/"
            }
            var visit_id = response_visit_id.responseJSON['visit_id'];
            var tuple_ids = response_visit_id.responseJSON['tuple_ids'];
            console.log("return now")
            return response_visit_id.responseJSON;
            // var ent_tuples = jqxhr.responseJSON['ent_tuples'];
        });
    } catch (error) {
        alert(error);
        window.location.href = "/";
    }
}
*/

window.onload = async function () {
    var cur_url = window.location.href;
    try {
        response_visit_id = $.getJSON(cur_url.replace("resultER", "create_visit_id"), function () {
            console.log("sent get_visit_id");
        });
        response_visit_id.done(function (data) {
            console.log("response from get_visit_id");
            console.log(response_visit_id.responseJSON)
            // console.log(jqxhr.responseJSON);
            var status = response_visit_id.responseJSON['success'];
            if (status != true) {
                alert("Error: " + status);
                window.location.href = "/"
            }
            var visit_id = response_visit_id.responseJSON['visit_id'];
            var tuple_ids = response_visit_id.responseJSON['tuple_ids'];
            show_results(visit_id, tuple_ids);
            // var ent_tuples = jqxhr.responseJSON['ent_tuples'];
        });
    } catch (error) {
        alert(error);
        window.location.href = "/";
    }
    // console.log(visit_id);
    

}

function show_results(visit_id, tuple_ids) {
    console.log(visit_id, tuple_ids);
    var cur_url = window.location.href;
    // update input field
    var model_name = cur_url.split("/")[4];
    var prompt = cur_url.split("/")[5].replaceAll("_", " ");
    var entity_pairs = cur_url.replaceAll("_", " ").split("/")[6].split("%5E");
    $(".M_type")[0].innerHTML = model_name;
    $(".relationship_name")[0].innerHTML = prompt;
    // http://10.127.7.234:8050/loading/distilbert-base-uncased/A_sells_B/apple~iphone%5Etesla~electronic_vehicle%5Enike~sneaker
    console.log(model_name, prompt, entity_pairs);
    $("#Model_type .selected")[0].innerHTML = model_name;
    $("#Relationship")[0].children[0].value = prompt;

    while (parent_entity_pair.childElementCount > 0) {
        parent_entity_pair.removeChild(parent_entity_pair.lastChild)
    }
    // console.log(entity_pairs)
    var seed_div = $(".seed_entity_div")[0];
    for (var i = 0; i < entity_pairs.length; i++) {
        var new_pairs = document.createElement("div");
        var new_span = document.createElement("span");
        var text_field1 = document.createElement("input");
        var text_field2 = document.createElement("input");
        new_pairs.setAttribute("class", "entity_pair_inputbox");
        new_span.setAttribute("class", "seed_entity_name");
        text_field1.setAttribute("type", "text");
        text_field2.setAttribute("type", "text");
        new_span.innerHTML = entity_pairs[i].replace("~", " & ");
        text_field1.value = entity_pairs[i].split("~")[0];
        text_field2.value = entity_pairs[i].split("~")[1];
        new_pairs.appendChild(text_field1);
        new_pairs.appendChild(text_field2);
        seed_div.appendChild(new_span);
        parent_entity_pair.appendChild(new_pairs);
    }

    try {
        jqxhr = $.getJSON(cur_url.replace("resultER", "update"), function () {
            console.log("sent update results");
        });
        jqxhr.done(function (data) {
            console.log("success update results");
            // console.log(jqxhr);
            console.log(jqxhr.responseJSON);
            // console.log(jqxhr.responseJSON);
            var prompts = jqxhr.responseJSON['prompts']
            var ent_tuples = jqxhr.responseJSON['ent_tuples']
            var target_div = $(".result_tuples")[0];
            // new_feedback.append("<b>Appended text</b>");
            var prompt_div = $(".prompt")[0];
            var score_div = $(".score")[0];

            //var download_but = document.querySelector(".download_but");
            //download_but.addEventListener('click', function () {
            //    funDownload(JSON.stringify(ent_tuples), 'tuples.json');    
            //});

            for (var i = 0; i < prompts.length; i++) {
                var new_prompt = document.createElement("div");
                new_prompt.setAttribute("class", "prompt_entity");
                new_prompt.innerHTML = prompts[i][0].replaceAll("<", "[").replaceAll(">", "]");
                prompt_div.appendChild(new_prompt);
                var new_score = document.createElement("div");
                new_score.setAttribute("class", "score_entity");
                new_score.innerHTML = prompts[i][1];
                score_div.appendChild(new_score);
            }
            for (var i = 0; i < ent_tuples.length; i++) {
                var new_span = document.createElement("span");
                var new_entity_span_1 = document.createElement("span");
                var new_entity_span_2 = document.createElement("span");
                var new_arrow = document.createElement("span");
                new_arrow.setAttribute("class", "each_tuple_RW");
                var new_rel = document.createElement("span");
                new_rel.setAttribute("class", "each_tuple_relationship");
                new_rel.innerHTML = "⟶" + prompt + "⟶";
                var new_weight = document.createElement("span");
                new_weight.setAttribute("class", "each_tuple_weight");
                new_weight.innerHTML = "weight: " + ent_tuples[i][1];
                // var new_div = document.createElement("div");
                new_source = document.createElement("span");
                new_source.setAttribute("class", "source_from");
                new_source.innerHTML = model_name;
                new_arrow.appendChild(new_rel);
                new_arrow.appendChild(new_weight);


                new_span.setAttribute("class", "each_tuple");
                new_entity_span_1.setAttribute("class", "entity1");
                new_entity_span_2.setAttribute("class", "entity2");
                new_entity_span_1.innerHTML = ent_tuples[i][0][0];
                new_entity_span_2.innerHTML = ent_tuples[i][0][1];
                //<span class="source_from">source:RoBERTa-large</span>
                new_span.appendChild(new_entity_span_1);
                new_span.appendChild(new_arrow);
                new_span.appendChild(new_entity_span_2);
                new_span.appendChild(new_source);
                /*
                new_span.innerHTML += `
                    <span class="each_tuple_FB">
                    <a class="check but">✓</a>
                    <a class="wrong but">X</a>
                    <a class="notknown but">N/A</a>
                    </span>`
                    ;
                */
                // rewrite the code above
                var new_feedback = document.createElement("span");
                new_feedback.setAttribute("class", "each_tuple_FB");
                var new_check = document.createElement("a");
                new_check.setAttribute("class", "check but");
                new_check.innerHTML = "✓";
                var new_wrong = document.createElement("a");
                new_wrong.setAttribute("class", "wrong but");
                new_wrong.innerHTML = "X";
                var new_notknown = document.createElement("a");
                new_notknown.setAttribute("class", "notknown but");
                new_notknown.innerHTML = "N/A";
                new_feedback.appendChild(new_check);
                new_feedback.appendChild(new_wrong);
                new_feedback.appendChild(new_notknown);
                new_span.appendChild(new_feedback);

                target_div.appendChild(new_span);

            }
            
            var but_list = $(".but");
            console.log(but_list)
            for (let i = 0; i < but_list.length; i++) {
                but_list[i].addEventListener('click', () => {
                    tuple_ind = Math.floor(i / 3)
                    choice = i % 3
                    update_choice(tuple_ind, choice, but_list)
                    console.log("tuple_id", tuple_ind, choice);
                    upload_feedback = $.getJSON(cur_url.split("resultER")[0] + "insert_feedback" + "/" + visit_id + "/" + tuple_ids[tuple_ind] + "/" + choice, function () {
                        console.log("sent feedback");
                    });
                    jqxhr.done(function (data) {
                        console.log("success feedback");
                        // console.log(jqxhr);
                        console.log(jqxhr.responseJSON);
                });
            });
          }
        });
    } catch (error) {
        alert(error);
        window.location.href = "/"
    }
}

selected.addEventListener("click", () => {
    optionsContainer.classList.toggle("active");
});

optionsList.forEach(e => {
    e.addEventListener("click", () => {
        selected.innerHTML = e.querySelector("label").innerHTML;
        optionsContainer.classList.remove("active");
    })
});

add_search.addEventListener("click", () => {
    if (parent_entity_pair.childElementCount < 5) {
        var new_pairs = document.createElement("div");
        var text_field1 = document.createElement("input");
        var text_field2 = document.createElement("input");
        new_pairs.setAttribute("class", "entity_pair_inputbox");
        text_field1.setAttribute("type", "text");
        text_field2.setAttribute("type", "text");
        new_pairs.appendChild(text_field1);
        new_pairs.appendChild(text_field2);
        parent_entity_pair.appendChild(new_pairs);
    }



})

min_search.addEventListener("click", () => {
    if (parent_entity_pair.childElementCount > 3) {
        parent_entity_pair.removeChild(parent_entity_pair.lastChild)
    }


})


submit_but.addEventListener('click', () => {

    var target_url = "/loading/"
    var model_name = $("#Model_type .selected")[0].innerHTML;
    target_url += model_name + "/";
    var prompt = $("#Relationship")[0].children[0].value;
    target_url += prompt + "/";
    var entity_pairs = $(".entity_pair")[0].children;
    for (var i = 0; i < entity_pairs.length; i++) {
        var entity_pair = entity_pairs[i];
        var head_entity = entity_pair.children[0].value;
        var tail_entity = entity_pair.children[1].value;
        target_url += head_entity + "~" + tail_entity;
        if (i < entity_pairs.length - 1) {
            target_url += "^";
        }
        console.log(target_url)
        //"flotation_device~boat^water~soft_drink^gear~car^giraffes~africa^trousers~suitcase"
    }
    target_url = target_url.replaceAll(" ", "_");
    console.log(target_url);
    // exit(0);
    location.href = target_url;
    // http://10.127.7.234:8050/loading/Distilbert/dasdg/a_b~%5Ec_d~%5Ee_f~
})

