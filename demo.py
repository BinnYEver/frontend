import os
import string

import fire
import json
from thefuzz import fuzz

from data_utils.data_utils import fix_prompt_style, is_valid_prompt
from search_prompts import get_paraphrase_prompt, get_paraphrase_prompt_with_quote
from models.gpt3 import GPT3
from models.knowledge_harvester import KnowledgeHarvester
import timeit
import random

MAX_N_PROMPTS = 5
# Prompts used for ranking. The searched prompts is doubled.

MAX_WORD_REPEAT = 3
MAX_ENT_SUBWORDS = 2
PROMPT_TEMP = 2.
SIMILARITY_THRESHOLD = 75
MAX_N_ENT_TUPLES = 20

def retrieve_results(model_name, init_prompts_str, seed_ent_tuples_str):
    prompts, ent_tuples = [], []

    init_prompts, seed_ent_tuples, rel = get_rel(
        init_prompts_str=init_prompts_str,
        seed_ent_tuples_str=seed_ent_tuples_str)

    if os.path.exists(f'results/demo/prompts/{rel}.json'):
        prompts = [[prompt, -1] for prompt in json.load(open(
            f'results/demo/prompts/{rel}.json'))]

    for max_n_ent_tuples in reversed([MAX_N_ENT_TUPLES]):
        result_path = f'results/demo/{max_n_ent_tuples}tuples/{model_name}' \
                      f'/{rel}/prompts.json'
        if os.path.exists(result_path):
            prompts = json.load(open(result_path))
            for i in range(len(prompts)):
                prompts[i][1] = f'{prompts[i][1]:.2f}'
            break

    for max_n_ent_tuples in reversed([MAX_N_ENT_TUPLES]):
        result_path = f'results/demo/{max_n_ent_tuples}tuples/{model_name}' \
                      f'/{rel}/ent_tuples.json'
        if os.path.exists(result_path) and json.load(open(result_path)) != []:
            ent_tuples = json.load(open(result_path))[:20]

            sum_weights = sum(t[1] for t in ent_tuples)
            for i in range(len(ent_tuples)):
                ent_tuples[i][1] = f'{ent_tuples[i][1] / sum_weights:.6f}'

            break

    return {'prompts': prompts, 'ent_tuples': ent_tuples}

def search_prompts(init_prompts, seed_ent_tuples, similarity_threshold,
                   output_path):
    gpt3 = GPT3()

    cache = {}
    prompts = []
    calls = 0
    while len(prompts) < MAX_N_PROMPTS * 2 and calls < 30:
        new_prompts = []
        current_prompts = init_prompts + prompts
        combinations = [(prompt, [ent.replace('_', ' ') for ent in ent_tuple]) for prompt in current_prompts\
             for ent_tuple in seed_ent_tuples]
        # avoid repetitive sampling
        combinations = [(prompt, ent_tuple) \
            for prompt, ent_tuple in combinations \
                if f'{prompt} ||| {ent_tuple}' not in cache]
        #     request_str = f'{prompt} ||| {ent_tuple}'
        inputs = random.sample(combinations * 2, min(2 * len(combinations), 2 * MAX_N_PROMPTS))
        for prompt, ent_tuple in inputs:
            cache[f'{prompt} ||| {ent_tuple}'] = 1
        if calls <= 25:
            calls += len(inputs)
            para_prompts = get_paraphrase_prompt_with_quote(
                gpt3=gpt3, inputs=inputs)
            for para_prompt in para_prompts:
                if para_prompt not in current_prompts:
                    new_prompts.append(para_prompt)

            # if len(set(prompts + new_prompts)) >= 5:
            #     break

        if len(new_prompts) == 0:
            break

        else:
            flag = False
            for new_prompt in sorted(new_prompts, key=lambda t: len(t)):
                # if len(prompts) != 0:
                #     max_sim = max([fuzz.ratio(new_prompt, prompt)
                #                    for prompt in prompts])
                #     print(f'-- {new_prompt}: {max_sim}')
                if len(prompts) == 0 or \
                        max([fuzz.ratio(new_prompt, prompt)
                             for prompt in prompts]) < similarity_threshold:
                    prompts.append(new_prompt)
                    flag = True

            prompts = list(set(prompts))
            prompts.sort(key=lambda s: len(s))
            prompts = [prompt for prompt in prompts if is_valid_prompt(
                prompt=prompt)]

            json.dump(
                [fix_prompt_style(prompt) for prompt in prompts],
                open(output_path, 'w'),
                indent=4)

            print('=== Searched-out prompts for now ===')
            for prompt in prompts:
                print(prompt)
            print('=' * 50)

            if len(prompts) >= 2 * MAX_N_PROMPTS or flag == False:
                break

    for i in range(len(prompts)):
        prompts[i] = fix_prompt_style(prompts[i])

    return prompts


def search_ent_tuples(
        init_prompts,
        seed_ent_tuples,
        prompts,
        model_name,
        max_n_ent_tuples,
        result_dir):

    start = timeit.default_timer()
    knowledge_harvester = KnowledgeHarvester(
        model_name=model_name,
        max_n_ent_tuples=0,
        max_n_prompts=MAX_N_PROMPTS,
        max_word_repeat=MAX_WORD_REPEAT,
        max_ent_subwords=MAX_ENT_SUBWORDS,
        prompt_temp=PROMPT_TEMP)

    cur = timeit.default_timer()
    print(f"loaded model ({max_n_ent_tuples}): ", cur - start)
    start = cur

    # print(f'Searching with max_n_ent_tuples={max_n_ent_tuples}...')

    knowledge_harvester.clear()
    knowledge_harvester._max_n_ent_tuples = max_n_ent_tuples

    knowledge_harvester.set_seed_ent_tuples(seed_ent_tuples=seed_ent_tuples)
    knowledge_harvester.set_prompts(prompts=init_prompts + prompts)

    knowledge_harvester.update_prompts()
    json.dump(knowledge_harvester.weighted_prompts, open(
        f'{result_dir}/prompts.json', 'w'), indent=4)

    cur = timeit.default_timer()
    print(f"update prompts ({max_n_ent_tuples}): ", cur - start)
    start = cur

    for prompt, weight in knowledge_harvester.weighted_prompts:
        print(f'{weight:.4f} {prompt}')

    knowledge_harvester.update_ent_tuples()
    json.dump(knowledge_harvester.weighted_ent_tuples, open(
        f'{result_dir}/ent_tuples.json', 'w'), indent=4)

    return knowledge_harvester.weighted_ent_tuples


def get_rel(init_prompts_str, seed_ent_tuples_str):
    init_prompts = init_prompts_str.split('^')
    seed_ent_tuples = [ent_tuple_str.split('~')
                       for ent_tuple_str in seed_ent_tuples_str.split('^')]

    init_prompts = sorted([prompt.replace('_', ' ') for prompt in init_prompts])
    seed_ent_tuples = sorted(
        [ent.lower().strip() for ent in ent_tuple]
        for ent_tuple in seed_ent_tuples)

    init_prompts_str = '^'.join([
        prompt.replace(' ', '_') for prompt in init_prompts])
    seed_ent_tuples_str = '^'.join(
        ['~'.join(ent_tuple) for ent_tuple in seed_ent_tuples])

    rel = f'INIT_PROMPTS-{init_prompts_str}_SEED-{seed_ent_tuples_str}'

    return init_prompts, seed_ent_tuples, rel


def find_in_rel_sets(rel, model_name):
    for rel_set in ['conceptnet', 'lama', 'human']:
        for rel_name, info in json.load(open(
                f'relation_info/{rel_set}.json')).items():
            init_prompts = info['init_prompts']
            seed_ent_tuples = info['seed_ent_tuples']

            for i, prompt in enumerate(init_prompts):
                prompt = prompt.strip(' .')
                prompt = prompt.replace(' ', '_')
                for ent_idx, ch in enumerate(string.ascii_uppercase):
                    prompt = prompt.replace(f'<ENT{ent_idx}>', ch)

                init_prompts[i] = prompt

            init_prompts_str = '^'.join([
                prompt.replace(' ', '_') for prompt in init_prompts])
            seed_ent_tuples_str = '^'.join(
                ['~'.join(ent_tuple) for ent_tuple in seed_ent_tuples])

            _, _, rel1 = get_rel(
                    init_prompts_str=init_prompts_str,
                    seed_ent_tuples_str=seed_ent_tuples_str)

            if rel == rel1:
                result_dir = f'results/{rel_set}/1000tuples_top20prompts/' \
                             f'{model_name}/{rel_name}'
                weighted_prompts = json.load(open(f'{result_dir}/prompts.json'))
                weighted_ent_tuples = json.load(
                    open(f'{result_dir}/ent_tuples.json'))

                return [prompt for prompt, weight in weighted_prompts], \
                       weighted_ent_tuples

    return None, None


def main(init_prompts_str,
         seed_ent_tuples_str,
         model_name='roberta-large',
         max_n_ent_tuples=100):

    init_prompts, seed_ent_tuples, rel = get_rel(
        init_prompts_str=init_prompts_str,
        seed_ent_tuples_str=seed_ent_tuples_str)

    for i, prompt in enumerate(init_prompts):
        for ent_idx, ch in enumerate(string.ascii_uppercase):
            prompt = prompt.replace(ch, f'<ent{ent_idx}>')
        prompt = prompt.replace('_', ' ').replace('<ent', '<ENT')
        init_prompts[i] = fix_prompt_style(prompt=prompt)

    print(f'Initial prompts: {init_prompts}')
    print(f'Seed entity tuples: {seed_ent_tuples}')
    print('=' * 50)
    prompts_output_dir = f'results/demo/prompts/'
    prompts_output_path = f'{prompts_output_dir}/{rel}.json'
    if os.path.exists(prompts_output_path):
        prompts = json.load(open(prompts_output_path))
        print("loaded prompts from cache.")
    else:
        os.makedirs(prompts_output_dir, exist_ok=True)
        json.dump([], open(prompts_output_path, 'w'))
        # why dump an empty list?
        prompts = find_in_rel_sets(rel=rel, model_name=model_name)[0]
        if prompts is not None:
            json.dump(prompts, open(prompts_output_path, 'w'), indent=4)
            print("loaded prompts from pre-defined sets.")
        if prompts is None:
            prompts = search_prompts(
                init_prompts=init_prompts,
                seed_ent_tuples=seed_ent_tuples,
                similarity_threshold=SIMILARITY_THRESHOLD,
                output_path=prompts_output_path)
            print("searched prompts with GPT-3")
    print('Searched-out prompts:')
    print('\n'.join(prompts))
    print('=' * 50)

    if max_n_ent_tuples == 0:
        return

    output_dir = f'results/demo/{max_n_ent_tuples}tuples/{model_name}'
    output_path = f'{output_dir}/{rel}/ent_tuples.json'
    if os.path.exists(output_path):
        print('Results found in cache.')
        for ent_tuple, weight in json.load(open(output_path))[:30]:
            print(ent_tuple, weight)
        print('=' * 50)
    else:
        print("Searching results")
        os.makedirs(f'{output_dir}/{rel}', exist_ok=True)
        json.dump([], open(output_path, 'w'))

        weighted_ent_tuples = find_in_rel_sets(
            rel=rel, model_name=model_name)[1]
        
        # weighted_ent_tuples = None
        
        if weighted_ent_tuples is None:
            weighted_ent_tuples = search_ent_tuples(
                init_prompts=init_prompts,
                seed_ent_tuples=seed_ent_tuples,
                prompts=prompts,
                model_name=model_name,
                max_n_ent_tuples=max_n_ent_tuples,
                result_dir=f'{output_dir}/{rel}/')
        json.dump(weighted_ent_tuples, open(output_path, 'w'), indent=4)

        for ent_tuple, weight in weighted_ent_tuples[:30]:
            print(ent_tuple, weight)
        print('=' * 50)

if __name__ == '__main__':
    fire.Fire(main)