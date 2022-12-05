var prompt_col = $(".prompt")[0].children;
var weight_col = $(".prompt_weight")[0].children;
const h2 = document.querySelector("h2");


var sample_json = {
    "prompts": [
        [
            "What is the best way to get rid of a cold?",
            -1
        ],
        [
            "What is the best way to get rid of a hot?",
            -1
        ]
    ],
    "ent_tuples": [
        [
            ["a", "b"],
            0.5
        ]
    ]
}
// var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20%2a%20from%20yahoo.finance.quotes%20WHERE%20symbol%3D%27WRC%27&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback';

const REFRESH_TIME = 4000;
function keep_refresh(url, state=0) {
    var jqxhr = 0;
    var instructions = [
        "Searching for the prompts...",
        "Loading the Language Model and scoring the prompts...",
        "Searching for entity pairs..."
    ]
    h2.innerText = instructions[state];
    console.log(url);
    try {
        jqxhr = $.getJSON(url, function() {
            console.log("sent");
        });
        jqxhr.done(function(data) {
            console.log("success");
            // console.log(jqxhr);
            console.log(jqxhr.responseJSON);
            // console.log(jqxhr.responseJSON);
            var prompts = jqxhr.responseJSON['prompts']
            var ent_tuples = jqxhr.responseJSON['ent_tuples']

            if (prompts.length > 0 && parseFloat(prompts[0][1]) > 0 && state == 1) {
                state = 2;
                for(var i = 0; i < prompt_col.length; i++) {
                    prompt_col[i].innerHTML = "";
                }
                for(var i = 0; i < prompts.length; i++) {
                    var prompt = prompts[i][0].replaceAll("<", "[").replaceAll(">", "]");
                    var weight = prompts[i][1];
                    prompt_col[i].innerHTML = prompt;
                    weight_col[i].innerHTML = weight;
                    weight_col[i].style.opacity = 1;
                }
                $(".prompt_weight")[0].style.opacity = "1";
                // h2.innerText = instructions[state];
                setTimeout(keep_refresh(url, state), REFRESH_TIME);
            }
            else if (prompts.length > 0 && (state == 0 || state == 1)) {
                state = 1;
                for(var i = 0; i < prompts.length; i++) {
                    var prompt = prompts[i][0].replaceAll("<", "[").replaceAll(">", "]");
                    // var weight = sample_json.prompts[i][1];
                    prompt_col[i].innerHTML = prompt;
                    prompt_col[i].style.opacity = 1;
                }
                $(".prompt")[0].style.opacity = "1";
                // h2.innerText = "Scoring the prompts...";
                console.log("current state: " + state);
                setTimeout(keep_refresh(url, state), REFRESH_TIME);
            }
            
            else if (ent_tuples.length > 0 && state == 2) {
                location.href = url.replace("/update/", "/resultER/");
                // break;
            }
            else {
                setTimeout(keep_refresh(url), REFRESH_TIME);
            }
            // draw_polygon(data);
        });
    } 
    catch (e) {
        console.log(e);
    }
}
window.onload = function () {
    // setTimeout(function () { location.href = "/resultER" }, 40000);
    var cur_url = window.location.href;
    var update_url = cur_url.replace("/loading/", "/update/")
    console.log(update_url)
    keep_refresh(update_url);
}