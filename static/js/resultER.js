const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
const optionsList = document.querySelectorAll(".option");
const add_search = document.querySelector(".add_entity");
const min_search = document.querySelector(".min_entity");
const parent_entity_pair = document.querySelector(".entity_pair");
const submit_but = document.querySelector('.submit_but');
let audio_sound = document.querySelectorAll("audio");
let but_list = document.querySelectorAll(".but");

window.onload = function () {
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
            console.log("sent");
        });
        jqxhr.done(function (data) {
            console.log("success");
            // console.log(jqxhr);
            console.log(jqxhr.responseJSON);
            // console.log(jqxhr.responseJSON);
            var prompts = jqxhr.responseJSON['prompts']
            var ent_tuples = jqxhr.responseJSON['ent_tuples']
            var target_div = $(".result_tuples")[0];
            // new_feedback.append("<b>Appended text</b>");
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
                new_span.innerHTML += `
                    <span class="each_tuple_FB">
                    <a href="" class="check">✓</a>
                    <a href="" class="wrong">X</a>
                    <a href="" class="notknown">N/A</a>
                    </span>`
                    ;
                target_div.appendChild(new_span);

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

for (let i = 0; i < but_list.length; i++) {
    but_list[i].addEventListener('mouseenter', () => {
        const audio = new Audio("static/but_hover_sound.mp3");
        audio.src = "static/but_hover_sound.mp3";
        audio.play();
    });
}