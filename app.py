import os
import time
import random
import string
import urllib.parse
from ftplib import FTP

from flask import Flask, redirect, render_template, request, session, flash, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "POIJlokjOIUYGuytDTRYD"
socketio = SocketIO(app)

users = ["Admin", "Tester", "admin", "tester", "ymmy", "sam"]
privates = {
    'ymmy_5mzpo3ati_sam' : [
        {
            'nickname': "ymmy",
            'text' : "Hey There! Welcome to Privates!😀",
            "date" : "17 JUL 7:02 PM"
        }
    
    ],
    'ymmy_o7npf7i82_admin' : [
        {
            'nickname': "admin",
            'text' : "Hey There! Welcome to Privates!😀",
            "date" : "18 JUL 7:02 PM"
        }
    ]
}

rooms = {
    'general' : [
        {
            'nickname': "Admin",
            'text' : "Hey There! Welcome to FlackyChat!😀",
            "date" : "24 JUN 10:27 PM"
        },
        {
            'nickname': "Admin",
            'text' : "Everything should look like this <a href='https://www.youtube.com/watch?v=Q8chuGwnHvk'> https://www.youtube.com/watch?v=Q8chuGwnHvk </a> ",
            "date" : "24 JUN 10:28 PM"
        },
        
        {
            'nickname': "Tester",
            'text' : "Please halp me",
            "date" : "24 JUN 10:29 PM"
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

@socketio.on("load private list")
def load(data):
    user_list = []
    # Loading Privates
    for i in privates:
        # Loading privates with  nickname
        if data['nickname'] in i:
            # Loading nickname2 from privates 
            for x in users:
                if x != data['nickname']:    
                    if x in i:
                        if user_list == "":
                            user_list = x
                        else:
                            user_list.append(x)

    emit('load_private_list', user_list)


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


@socketio.on("system message")
def system(data):
    message={
        "system" : "system",
        "status" : data["status"],
        "nickname" : data['nickname'],
        "old_nickname" : data['old_nickname'],
        "date" : data['date']
    }
    if data["status"] == "left":
        emit("system OK", message, room=data['left_room'])
    if data["status"] == "join":
        emit("system OK", message, room=data['join_room'])
    if data["status"] == "connect":
        room = data['room']
        emit("system OK", message, room=room)
    if data["status"] == "disconnect":
        room = data['room']
        emit("system OK", message, room=room)



@socketio.on("submit comment")
def vote(data):
    room = data['room']
    print("text received = " + data['text'])
    if room in rooms:
        comment={
        "nickname" : data['nickname'],
        "text" : data['text'],
        "date" : data['date']
        }
        if (len(rooms[room]) == 100):
            rooms[room].pop(0)
        if len(rooms[room]) == 0:
            rooms[room] = []
        rooms[room].append(comment)
    elif room in privates:
        socketio.server.enter_room(data['channel'], room)
        socketio.server.enter_room(request.sid, room)
        comment={
        'private' : True,
        'channel' : data['channel'],
        "nickname" : data['nickname'],
        "text" : data['text'],
        "date" : data['date']
        }
        if (len(privates[room]) == 100):
            privates[room].pop(0)
        if len(privates[room]) == 0:
            privates[room] = []
        privates[room].append(comment)
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
        emit("channel OK", channel)

@socketio.on("load_channel")
def load(data):
    old_room = data['old_room']
    room=data["room"]
    if room in rooms:
        leave_room(old_room)
        join_room(room)
        messages = rooms[room]
        emit("load channel", {'private': False, "old_room": old_room,"room": room, "messages": messages})
    elif room in privates:
        leave_room(old_room)
        join_room(room)
        messages = privates[room]
        emit("load channel", {'private': True, "old_room": old_room,"room": room, "messages": messages})
    emit('left room', {"left_room": old_room, "join_room" : room})

@socketio.on("load_privates")
def load(data):
    old_room = data['old_room']
    room=data["room"]
    
    
    # Checking if room exists
    exists = False
    if room not in privates:
        for i in privates:
            if data['nickname'] in i:
                if data['nickname2'] in i:
                    messages = privates[i]
                    exists = True
                    room = i
        if not exists:
            privates.update({room: ""})
            messages = privates[room]
    leave_room(old_room)
    join_room(room)
    emit("load channel", {'private': True, "old_room": old_room,"room": room, "messages": messages})



@socketio.on("load users")
def load():
    emit("load_users", users)

if __name__ == '__main__':
	socketio.run(app)