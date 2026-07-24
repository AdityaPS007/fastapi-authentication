import bcrypt

password="ronaldo@7"
hashed_password=bcrypt.hashpw(password.encode(),bcrypt.gensalt())
print(hashed_password)
result=bcrypt.checkpw(password.encode(),hashed_password)
print(result)