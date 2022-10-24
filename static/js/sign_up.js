const container = document.querySelector('.container');
const btn_login = document.querySelector('.btn-login');
const password = document.querySelector('#password');
const confirm_password = document.querySelector('#confirm_password');
const h1 = document.querySelector('h1');

btn_login.addEventListener('click', function () {
    if (password.value != confirm_password.value || password.value == "" || confirm_password.value == "") {
        h1.innerHTML = 'Please check your account or password';
    }
    else {
        h1.innerHTML = 'Welcome';
        container.classList.add('success');
        setTimeout(function () { location.href = "/home" }, 3000);
    }


})