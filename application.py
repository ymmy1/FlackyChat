import os
import requests

from flask import Flask, redirect, render_template, request, session, flash, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = ["Admin", "Tester", "admin", "tester"]

rooms = {
    'general' : [
        {
            'nickname': "Admin",
            'text' : "Hey There! Welcome to FlackChat!",
            "date" : "24 JUN 10:27 PM"
        },
        {
            'nickname': "Tester",
            'text' : "Please halp me",
            "date" : "24 JUN 10:28 PM"
        }],
    'flackychat' : [
        {
            'nickname': "Tester",
            'text' : "Please halp me",
            "date" : "24 JUN 10:28 PM"
        }]
}

@app.route("/")
def index():
    return render_template("index.html",  rooms = rooms)

@socketio.on("new user")
def user(user):
    user_exists = 0
    for i in range(len(users)):
        if(users[i] == user["user"]):
            user_exists = user_exists + 1
    
    if(user_exists > 0):
        emit("user exists")
    else:
        emit('register OK') 

@socketio.on("registering user")
def user(user):
    users.append(user["user"])

@socketio.on("changing user")
def user(user):
   
    for i in range(len(users)):
        if (users[i] == user["old_nickname"]):
            users[i] = user["new_nickname"]
    for room in rooms:
        for row in rooms[room]:
            if (row["nickname"] == user["old_nickname"]):
                row["nickname"] = user["new_nickname"]
    emit("Changing_user", old_nickname, new_nickname, broadcast=True)

@socketio.on("system message")
def system(data):
    message={
        "system" : "system",
        "status" : data["status"],
        "nickname" : data['nickname'],
        "old_nickname" : data['old_nickname'],
        "date" : data['date']
    }
    
    if data["status"] == "change":
        emit("system OK", message, broadcast=True)
    else:
        room = data['room']
        emit("system OK", message, room=room)


@socketio.on("submit comment")
def vote(data):
    room = data['room']
    comment={
        "nickname" : data['nickname'],
        "text" : data['text'],
        "date" : data['date']
    }
    if (len(rooms[room]) == 100):
        rooms[room].pop(0)

    print('printing rooms:')    
    print(rooms)
    print(rooms[room])
    if len(rooms[room]) == 0:
        rooms[room] = []
    rooms[room].append(comment)

    emit("comment OK", comment, room=room)

@socketio.on("adding channel")
def new_channel(data):
    channel = data["name"]
    
    status = 0
    if channel in rooms:
            status = status + 1
    if(status > 0):
        emit("channel fail")
    if(status == 0):
        rooms.update({channel: ""})
        emit("channel OK", channel, broadcast=True)

@socketio.on("load_channel")
def load(data):
    print("load channnel started")
    old_room = data['old_room']
    room=data["room"]
    leave_room(old_room)
    join_room(room)
    messages = rooms[room]
    emit("load channel", {"old_room": old_room,"room": room, "messages": messages})

@socketio.on("load users")
def load():
    emit("load_users", users)