
document.addEventListener('DOMContentLoaded', () => {


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    console.log("Room LocalStorage is: "+ localStorage.getItem("room"))
    if (localStorage.getItem('room') == null){
        localStorage.setItem('room', 'general');
        console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"))
        }
    // socket.emit("render room", {"room":  localStorage.getItem('room')});

    // Var for months
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    // When connected, configure buttons
    socket.on('connect', () => {

        if (localStorage.getItem('nickname') !== null){
            const status = "connect"
            const nickname = localStorage.getItem('nickname');
            const today = new Date()
            const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
            socket.emit('system message', {"nickname": nickname,'date': date, "status" : status});
        
            const bubbles = document.querySelectorAll(".bubble")
            for(i = 0; i < bubbles.length; i++){
                if (document.querySelectorAll(".head_s")[i]["innerText"] == localStorage.getItem('nickname')){
                    document.querySelectorAll(".bubble")[i].classList.remove("message_from");
                    document.querySelectorAll(".bubble")[i].classList.add("message_to");
                }
            }
        }
        // sending to the room they left off
        document.querySelector(`.${localStorage.getItem('room')}`).classList.add("active");
        document.getElementById("general").style.display="none";
        document.getElementById(localStorage.getItem('room')).style.display="flex";
        // Each button should emit a "submit vote" event
        document.querySelector('#the_comment').onsubmit = (e) => { 

                e.preventDefault();
                const text = document.querySelector('.type_message').value;
                if (text[0] == " "){
                    return false
                }
                const nickname = localStorage.getItem('nickname');
                const today = new Date()
                const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();

                document.querySelector('.type_message').value= ""
                socket.emit('submit comment', {"room" : localStorage.getItem('room'), 'text': text, 'nickname': nickname, 'date': date});
            };
    });
    
    socket.on('disconnect', () => {

        if (localStorage.getItem('nickname') !== null){
            const status = "disconnect"
            const nickname = localStorage.getItem('nickname');
            const today = new Date()
            const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
            socket.emit('system message', {"nickname": nickname,'date': date, "status" : status});
        }
    });

    // When a new vote is announced, add to the unordered list
    socket.on('comment OK', data => {
        
        // bubble div
        const bubble = document.createElement('div');
        bubble.setAttribute('class', 'bubble message_from');
        bubble.innerHTML = `<div class="heading"><p class="head_p"><strong class="head_s"> ${data.nickname}</strong><span class="date"> ${data.date}</span></p></div><div class="message"><p class="mess_p"> ${data.text}</p></div>`
        document.getElementById(localStorage.getItem('room')).appendChild(bubble);
        
        const bubbles = document.querySelectorAll(".bubble");
        for(i = 0; i < bubbles.length; i++){
            if (document.querySelectorAll(".head_s")[i]["innerText"] == localStorage.getItem('nickname')){
                document.querySelectorAll(".bubble")[i].classList.remove("message_from");
                document.querySelectorAll(".bubble")[i].classList.add("message_to");
            }
        }

        var objDiv = document.getElementById(localStorage.getItem('room'));
        objDiv.scrollTop = objDiv.scrollHeight;

    });

    socket.on('system OK', data => {
        
        // system span
        const system = document.createElement('span');
        system.setAttribute('class', 'system');
        console.log(data.status)
        if(data.status == "connect")
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has connected <span class="date">${data.date}</span></p>`
        if(data.status == "disconnect"){
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has disconnected <span class="date">${data.date}</span></p>`        
            getElementById(localStorage.getItem('room')).appendChild(system);
        }
        var objDiv = document.getElementById(localStorage.getItem('room'));
        objDiv.scrollTop = objDiv.scrollHeight;
    });


    document.querySelector('#join').disabled = true;


    if(!localStorage.getItem('nickname'))
        $('#exampleModalCenter').modal('show');
    else
    {
        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
    }
            

    document.querySelector('#join_name').onkeyup = () => {
        
        document.getElementById("join").setAttribute("data-dismiss", "none");
        const whitespace = document.querySelector('#join_name').value.indexOf(' ');
        const alt = document.querySelector('#join_name').value.indexOf(" ");   
        
        if (alt >= 0){
            document.getElementById('error-mesage-registration').style.display='block';
            document.getElementById('error-mesage-registration').innerHTML='Please remove all nbsp :)';
            
        }
        if (whitespace >= 0){
            document.getElementById('error-mesage-registration').style.display='block';
            document.getElementById('error-mesage-registration').innerHTML='Please remove all spaces';
        }

        if (alt < 0 && whitespace < 0){
            if (document.querySelector('#join_name').value.length > 0){
                socket.emit('new user', {'user': document.querySelector('#join_name').value});
            }
                   
            else
                document.querySelector('#join').disabled = true;
        }
        socket.on('user exists', () => {
            console.log("soket.on USER EXISTS");
            document.getElementById('error-mesage-registration').innerHTML='User exists';
            document.getElementById('error-mesage-registration').style.display='block';
            document.querySelector('#join').disabled = true;
        });
    
        socket.on('register OK', () => {
            console.log("REGISTER OK");
            document.getElementById("join").setAttribute("data-dismiss", "modal");
            document.getElementById('error-mesage-registration').style.display='none';
            document.querySelector('#join').disabled = false;
        });
    
    };
    
    
    
    document.querySelector('#join').onclick = () => {
        const nickname  = document.getElementById("join_name").value
        localStorage.setItem('nickname', nickname);

        socket.emit('registering user', {'user': document.querySelector('#join_name').value});


        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
        alert(`Hello ${localStorage.getItem('nickname')}`);
        const today = new Date()
        const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
        const status = "connect";
        socket.emit('system message', {"nickname": nickname,'date': date, "status" : status});
    };

    // Adding Channels to channel list
    load_channel();

    document.getElementById("add_channel").addEventListener ("click", submitChannel)
    document.getElementById("add_channel_form").addEventListener ("submit", submitChannel)
    function submitChannel(e) {
        e.preventDefault();

        const whitespace = document.querySelector('.add_channel_name').value.indexOf(' ');
        const alt = document.querySelector('.add_channel_name').value.indexOf(" ");
        if (alt < 0 && whitespace < 0){
            if (document.querySelector('.add_channel_name').value.length > 0){
                const channel_name = document.querySelector('.add_channel_name').value.toLowerCase();
                socket.emit("adding channel", {"name": channel_name})
            }
            else
                return false
        }
        else
            return false
    };
    socket.on('channel fail', () => {
        console.log("channel FAIL")
        alert("Channel exists")
    });
    socket.on('channel OK', data => {
        console.log("channel OK")
        const ul = document.querySelector('.channel_list_ul')
        const li = document.createElement('li');
        li.setAttribute('class', `${data} nav-link `);
        li.setAttribute('data-page', data);
        li.innerHTML = `#${data}`;
        ul.append(li)
        document.querySelector('.add_channel_name').value = "";

        load_channel();

        const channel_div = document.createElement('div');
        channel_div.setAttribute('class', 'messages');
        channel_div.setAttribute('id', data);
        document.querySelector(".chat").appendChild(channel_div);
        
    });
    

    // Switching between channels
    
});

function load_channel() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = () => {
            load_page(link.dataset.page);
            
            return false;
        };
    });
};
function load_page(name) {
    if(document.querySelector('.active'))
        document.querySelector('.active').classList.remove("active")
    document.querySelector(`.${name}`).classList.add("active");
    document.getElementById(localStorage.getItem('room')).style.display="none";
    localStorage.setItem('room', name);
    document.getElementById(localStorage.getItem('room')).style.display="flex";
    console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"));
    
};