const prompt_col = document.querySelector(".prompt");
const weight_col = document.querySelector(".prompt_weight");
const h2 = document.querySelector("h2");

window.onload = function () {
    // setTimeout(function () { location.href = "/resultER" }, 40000);
    setTimeout(function () {
        prompt_col.style.opacity = "1";
        h2.innerText = "Curring procedure status: Scoring the prompts"
    }, 10000)
    setTimeout(function () {
        weight_col.style.opacity = "1";
        h2.innerText = "Curring procedure status: Updating the prompts"
    }, 20000)
    setTimeout(function () {

        for (var i = 0; i < weight_col.childElementCount; i++) {

            weight_col.children[i].innerHTML = "score" + i;
        }
        h2.innerText = "Curring procedure status: Searching and weighting tuples"
    }, 30000)
}