from mysql.connector import connect

def create_db():
    db = connect_to_db()
    cursor = db.cursor()
    # check if Queries table exists, if yes, drop it
    drop = input("Do you want to drop current tables? (y/n)")
    if not drop:
        return

    cursor.execute("DROP TABLE IF EXISTS Feedbacks")
    cursor.execute("DROP TABLE IF EXISTS Visits")
    cursor.execute("DROP TABLE IF EXISTS Prompts")
    cursor.execute("DROP TABLE IF EXISTS Tuples")
    cursor.execute("DROP TABLE IF EXISTS Queries")
    
    cursor.execute("CREATE TABLE Queries (id int auto_increment primary key, model_name varchar(255), init_prompts_str varchar(255), seed_ent_tuples_str varchar(255))")
    cursor.execute("CREATE TABLE Prompts (id int auto_increment primary key, query_id int, prompt varchar(255), score float, FOREIGN KEY (query_id) REFERENCES Queries(id))")
    cursor.execute("CREATE TABLE Tuples (id int auto_increment primary key, query_id int, head varchar(255), tail varchar(255), score float, FOREIGN KEY (query_id) REFERENCES Queries(id))")
    cursor.execute("CREATE TABLE Visits (id int auto_increment primary key, query_id int, FOREIGN KEY (query_id) REFERENCES Queries(id))")
    cursor.execute("CREATE TABLE Feedbacks (id int auto_increment primary key, visit_id int, tuple_id int, feedback int, FOREIGN KEY (visit_id) REFERENCES Visits(id), FOREIGN KEY (tuple_id) REFERENCES Tuples(id))")
    cursor.close()

def create_visit_id(db, model_name, init_prompts_str, seed_ent_tuples_str, results):
    # db = connect_to_db()
    cursor = db.cursor()
    # check if the query already exists
    cursor.execute("SELECT * FROM Queries WHERE model_name = %s AND init_prompts_str = %s AND seed_ent_tuples_str = %s", (model_name, init_prompts_str, seed_ent_tuples_str))
    if cursor.fetchone():
        cursor.execute("SELECT id FROM Queries WHERE model_name = %s AND init_prompts_str = %s AND seed_ent_tuples_str = %s", (model_name, init_prompts_str, seed_ent_tuples_str))
        query_id = cursor.fetchone()[0]
        # find all the prompts and ent_tuples ids
        # cursor.execute("SELECT id FROM Prompts WHERE query_id = %s", (query_id,))
        # prompt_ids = cursor.fetchall()
        cursor.execute("SELECT id FROM Tuples WHERE query_id = %s", (query_id,))
        tuple_ids = cursor.fetchall()
        cursor.execute("INSERT INTO Visits (query_id) VALUES (%s)", (query_id,))
        # get visit id
        cursor.execute("SELECT LAST_INSERT_ID()")
        visit_id = cursor.fetchone()[0]
        db.commit()
        cursor.close()
        return {
            "visit_id": visit_id,
            "tuple_ids": tuple_ids,
            "success": True
        }

    else:
        cursor.execute("INSERT INTO Queries (model_name, init_prompts_str, seed_ent_tuples_str) VALUES (%s, %s, %s)", (model_name, init_prompts_str, seed_ent_tuples_str))
        # create a new visit
        cursor.execute("SELECT LAST_INSERT_ID()")
        query_id = cursor.fetchone()[0]
        cursor.execute("INSERT INTO Visits (query_id) VALUES (%s)", (query_id,))
        # get visit id
        cursor.execute("SELECT LAST_INSERT_ID()")
        visit_id = cursor.fetchone()[0]
        prompts = results['prompts']
        # only insert prompts and ent_tuples when there are no same query
        for prompt in prompts:
            cursor.execute("INSERT INTO Prompts (query_id, prompt, score) VALUES (%s, %s, %s)", (query_id, prompt[0], prompt[1]))
        ent_tuples = results['ent_tuples']
        tuple_ids = []
        for ent_tuple in ent_tuples:
            cursor.execute("INSERT INTO Tuples (query_id, head, tail, score) VALUES (%s, %s, %s, %s)", (query_id, ent_tuple[0][0], ent_tuple[0][1], ent_tuple[1]))
            cursor.execute("SELECT LAST_INSERT_ID()")
            tuple_id = cursor.fetchone()[0]
            tuple_ids.append(tuple_id)
        db.commit()
        cursor.close()
        return {
            "visit_id": visit_id,
            "tuple_ids": tuple_ids,
            "success": True
        }

def insert_feedback(visit_id, tuple_id, feedback):
    db = connect_to_db()
    cursor = db.cursor()
    # if visit_id and tuple_id already exist, update the feedback
    cursor.execute("SELECT * FROM Feedbacks WHERE visit_id = %s AND tuple_id = %s", (visit_id, tuple_id))
    if cursor.fetchone():
        cursor.execute("UPDATE Feedbacks SET feedback = %s WHERE visit_id = %s AND tuple_id = %s", (feedback, visit_id, tuple_id))
    else:
        cursor.execute("INSERT INTO Feedbacks (visit_id, tuple_id, feedback) VALUES (%s, %s, %s)", (visit_id, tuple_id, feedback))
    db.commit()
    cursor.close()


def connect_to_db():
    db = connect(
        host="localhost",
        user="root",
        passwd="UCSDmysql_",
        database="bertnet"
    )
    return db

if __name__ == '__main__':
    create_db()
    # print(create_query_id('model_name', 'init_prompts_str', 'seed_ent_tuples_str'))p