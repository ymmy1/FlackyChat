import os
import requests

from flask import Flask, redirect, render_template, request, session, flash, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = ["Admin", "Tester"]

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
    'flackychat' : []
}

@app.route("/")
def index():
    return render_template("index.html", general=rooms['general'], rooms = rooms)

@app.route("/<room>")
def room(room):
    return room

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

@socketio.on("system message")
def system(data):
    message={
        "system" : "system",
        "status" : data["status"],
        "nickname" : data['nickname'],
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
    rooms['general'].append(comment)

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