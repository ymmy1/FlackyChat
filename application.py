import os
import requests

from flask import Flask, redirect, render_template, request, session, flash, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = ["admin", "tester"]

rooms = {
    'general' : [
        {
            'nickname': "Oleg",
            'text' : "Hello!",
            "date" : "24 JUN 10:27 PM"
        },
        {
            'nickname': 'Admin',
            "text" : "Hey!",
            "date" : "24 JUN 10:29 PM"
        }
    ]
}

@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("new user")
def user(user):
    user_exists = 0
    for i in range(len(users)):
        if(users[i] == user["user"]):
            user_exists = user_exists + 1
            print(user_exists)
    
    if(user_exists > 0):
        print("emitting('user exist')")
        emit("user exists")
    else:
        print("emitting('register OK')")
        emit('register OK') 

@socketio.on("registering user")
def user(user):
    users.append(user["user"])
    print(users)

# @socketio.on("submit comment")
# def vote(data):
#     rooms['general'][] = data["text"]
#     nickname = data["nickname"]
#     date = data["date"]

#     votes[selection] += 1
#     emit("vote totals", votes, broadcast=True)
