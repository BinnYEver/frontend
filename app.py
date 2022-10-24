

from apps import create_app
from flask import render_template

app = create_app()


@app.route('/', methods=['GET', 'POST'])
@app.route('/home', methods=['GET', 'POST'])
def index():
    return render_template('home.html')


@app.route('/log_in')
def log_in():
    return render_template('log_in.html')


@app.route('/sign_up')
def sign_up():
    return render_template('sign_up.html')


@app.route('/resultER', methods=['POST', 'GET'])
def resultER():
    return render_template('resultER.html')


@app.route('/loading')
def loading():
    return render_template('loading.html')


if __name__ == "__main__":
    app.run()
