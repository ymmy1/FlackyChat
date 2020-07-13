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

@socketio.on("changing user")
def user(user):
   
    for i in range(len(users)):
        if (users[i] == user["old_nickname"]):
            print("user ")
            print(users[i])
            print(" found")
            users[i] = user["new_nickname"]
            print("changed to ")
            print(users[i])
    for room in rooms:
        for row in rooms[room]:
            if (row["nickname"] == user["old_nickname"]):
                print(row["nickname"])
                print(" is messaging as ")
                row["nickname"] = user["new_nickname"]
                print(row["nickname"])

@socketio.on("system message")
def system(data):
    message={
        "system" : "system",
        "status" : data["status"],
        "nickname" : data['nickname'],
        "old_nickname" : data['old_nickname'],
        "date" : data['date']
    }
    emit("system OK", message, broadcast=True)


@socketio.on("submit comment")
def vote(data):
    comment={
        "nickname" : data['nickname'],
        "text" : data['text'],
        "date" : data['date']
    }
    if (len(rooms['general']) == 100):
        rooms['general'].pop(0)
    rooms[data['room']].append(comment)

    emit("comment OK", comment, broadcast=True)

@socketio.on("adding channel")
def new_channel(data):
    print("received the channel name")
    channel = data["name"]
    status = 0
    if channel in rooms:
            status = status + 1
    if(status > 0):
        print("channel fail")
        emit("channel fail")
    if(status == 0):
        print("channel OK")
        rooms.update({channel : ""})
        emit("channel OK", channel, broadcast=True)
    print(rooms)

@socketio.on("load channel")
def load(data):
    join_room(data["room"])
    emit("loaded channel", room=data["room"], messages=rooms[data["room"]])