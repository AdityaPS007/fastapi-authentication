import sqlite3


def get_db_connection():
    return sqlite3.connect("users.db")

conn=sqlite3.connect("users.db")
cursor=conn.cursor()

cursor.execute("""
               create table if not exists users(
                   id integer primary key,
                   name text,
                   email text,
                   password text)""")

conn.commit()
conn.close()
print("Database Created Successfully")