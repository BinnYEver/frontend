const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
const optionsList = document.querySelectorAll(".option");
const submit_but = document.querySelector('.submit_but');
const add_search = document.querySelector(".add_entity");
const min_search = document.querySelector(".min_entity");
const parent_entity_pair = document.querySelector(".entity_pair");









selected.addEventListener("click", () => {
    optionsContainer.classList.toggle("active");
});

optionsList.forEach(e => {
    e.addEventListener("click", () => {
        selected.innerHTML = e.querySelector("label").innerHTML;
        optionsContainer.classList.remove("active");
    })
});

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