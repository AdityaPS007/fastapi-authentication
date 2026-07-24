import sqlite3

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