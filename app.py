

from apps import create_app, db
from flask import render_template, jsonify
import os

from demo import MAX_N_ENT_TUPLES, retrieve_results

app = create_app()
bertnet_db = db.connect_to_db()

def init_database():
    db.connect_to_db()

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

@app.route('/insert_feedback/<visit_id>/<tuple_id>/<feedback>')
def insert_feedback(visit_id, tuple_id, feedback):
    status = db.insert_feedback(visit_id, tuple_id, feedback)
    return jsonify(status)

@app.route('/create_visit_id/<model_name>/<init_prompts_str>/<seed_ent_tuples_str>')
def create_visit_id(model_name, init_prompts_str, seed_ent_tuples_str):
    results = retrieve_results(
        model_name=model_name,
        init_prompts_str=init_prompts_str,
        seed_ent_tuples_str=seed_ent_tuples_str)
    visit_id = db.create_visit_id(bertnet_db, model_name, init_prompts_str, seed_ent_tuples_str, results)
    return jsonify(visit_id)

@app.route('/resultER/<model_name>/<init_prompts_str>/<seed_ent_tuples_str>')
def resultER(model_name, init_prompts_str, seed_ent_tuples_str):
    return render_template('resultER.html')


@app.route('/loading')
def loading():
    return render_template('loading.html')


@app.route('/loading/<model_name>/<init_prompts_str>/<seed_ent_tuples_str>')
def predict(model_name, init_prompts_str, seed_ent_tuples_str):
    # init_prompts_str = init_prompts_str.replace(' ', '_')
    search(
        model_name=model_name,
        init_prompts_str=init_prompts_str,
        seed_ent_tuples_str=seed_ent_tuples_str)
    return render_template('loading.html')


@app.route('/update/<model_name>/<init_prompts_str>/<seed_ent_tuples_str>')
def update(model_name, init_prompts_str, seed_ent_tuples_str):
    # init_prompts_str = init_prompts_str.replace(' ', '_')
    return jsonify(retrieve_results(
        model_name=model_name,
        init_prompts_str=init_prompts_str,
        seed_ent_tuples_str=seed_ent_tuples_str))


def search(model_name, init_prompts_str, seed_ent_tuples_str):
    command = f'python demo.py' + \
    f' --model_name {model_name}' + \
    f' --init_prompts_str {init_prompts_str}' + \
    f' --seed_ent_tuples_str {seed_ent_tuples_str}' + \
    f' --max_n_ent_tuples {MAX_N_ENT_TUPLES}' + \
    f' &'


    print(command)
    os.system(command)


app.run(host='0.0.0.0', port=8050, debug=True)
