    // Connect to websocket
var socket = io.connect("https://flackychat.herokuapp.com/");
document.addEventListener('DOMContentLoaded', () => {


    // Var for months
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    localStorage.setItem('room', 'general');
    console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"))
    
    // When connected, configure buttons
    socket.on('connect', () => {

        if (localStorage.getItem('nickname') != null){
            const status = "connect"
            const nickname = localStorage.getItem('nickname');
            const today = new Date()
            const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
            socket.emit("load private list", {"nickname": localStorage.getItem('nickname')});;
            load_channel();

            // changing styles for senders messages
            const bubbles = document.querySelectorAll(".bubble")
            for(i = 0; i < bubbles.length; i++){
                if (document.querySelectorAll(".head_s")[i]["innerText"] == localStorage.getItem('nickname')){
                    document.querySelectorAll(".bubble")[i].classList.remove("message_from");
                    document.querySelectorAll(".bubble")[i].classList.add("message_to");
                }
            }
        }

        // sending to the room they left off
        
        
        // Each button should emit a "submit vote" event
        document.querySelector('#the_comment').onsubmit = (e) => { 

                e.preventDefault();
                const text = $(".type_message").val();
                if (text[0] == " "){
                    return false
                }
                const nickname = localStorage.getItem('nickname');
                const today = new Date()
                const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
                const channel = document.querySelector('.active').innerText;

                
                console.log("sending text = " + text)
                socket.emit('submit comment', {
                    'channel' : channel, 
                    "room" : localStorage.getItem('room'), 
                    "text": $("#type_message").val(), 
                    'nickname': nickname, 
                    'date': date
                });
                document.querySelector('.type_message').value= ""
            };
    });
    
    socket.on('disconnect', () => {

        if (localStorage.getItem('nickname') !== null){
            const status = "disconnect"
            const nickname = localStorage.getItem('nickname');
            const today = new Date()
            const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
            socket.emit('system message', {"room": localStorage.getItem('room'), "nickname": nickname,"old_nickname": nickname, 'date': date, "status" : status});
        }
    });

    socket.on('left room', data => {
        const status = "left"
        const nickname = localStorage.getItem('nickname');
        const today = new Date()
        const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
        
        if(data.join_room == data.left_room && localStorage.getItem('nickname'))
        {
            socket.emit('system message', {"join_room": data.join_room, "left_room": data.left_room, "nickname": nickname,"old_nickname": nickname, 'date': date, "status" : 'join'});
        }
        else
        {
            socket.emit('system message', {"join_room": data.join_room, "left_room": data.left_room, "nickname": nickname,"old_nickname": nickname, 'date': date, "status" : status});
            socket.emit('system message', {"join_room": data.join_room, "left_room": data.left_room, "nickname": nickname,"old_nickname": nickname, 'date': date, "status" : 'join'});
        }


    });

    // When a new vote is announced, add to the unordered list
    socket.on('comment OK', data => {
        console.log("COMMENT OK")
        // bubble div
        const bubble = document.createElement('div');
        bubble.setAttribute('class', 'bubble message_from');
        bubble.innerHTML = `<div class="heading"><p class="head_p"><strong class="head_s"> ${data.nickname}</strong><span class="date"> ${data.date}</span></p></div><div class="message"><p class="mess_p"> ${data.text}</p></div>`
        document.getElementById('messages').appendChild(bubble);
        
        const bubbles = document.querySelectorAll(".bubble");
        for(i = 0; i < bubbles.length; i++){
            if (document.querySelectorAll(".head_s")[i]["innerText"] == localStorage.getItem('nickname')){
                document.querySelectorAll(".bubble")[i].classList.remove("message_from");
                document.querySelectorAll(".bubble")[i].classList.add("message_to");
            }
        };
        var objDiv = document.getElementById('messages');
        objDiv.scrollTop = objDiv.scrollHeight;

    });


    socket.on('system OK', data => {
        
        // system span
        const system = document.createElement('span');
        system.setAttribute('class', 'system');
        if(data.status == "connect")
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has connected <span class="date">${data.date}</span></p>`
        if(data.status == "left")
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has left the room <span class="date">${data.date}</span></p>`
        if(data.status == "join")
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has joined the room <span class="date">${data.date}</span></p>`
        if(data.status == "disconnect")
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has disconnected <span class="date">${data.date}</span></p>`        

        var objDiv = document.getElementById('messages');
        objDiv.appendChild(system);
        objDiv.scrollTop = objDiv.scrollHeight;
    });

    // Loading Private list users
    socket.on('load_private_list', data => {
        document.getElementById('nickname_list_ul').innerHTML = "";
            
        for(i=0; i < data.length; i++)
        {
            if(data[i] != localStorage.getItem('nickname'))
            {
                const li = document.createElement('li');
                li.setAttribute('class', 'pm_nickname');
                li.setAttribute('data-page', data[i]);
                const newclass = "pm_"+ data[i];
                li.classList.add(newclass);
                li.innerHTML = data[i];
                document.getElementById('nickname_list_ul').appendChild(li);
            }
        
        }
        
        load_privates(localStorage.getItem('room'))
    });

    // joib registration button is disabled
    document.querySelector('#join').disabled = true;

    // Registering if new
    if(!localStorage.getItem('nickname'))
    {
        $('#exampleModalCenter').modal('show');
    }
        
    else
    {
        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
    }

            
    // Registration check
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
    
    // Registration submit
    document.querySelector('#join').onclick = () => {
        const nickname  = document.getElementById("join_name").value
        localStorage.setItem('nickname', nickname);

        socket.emit('registering user', {'user': document.querySelector('#join_name').value});


        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
        const today = new Date()
        const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
        const status = "connect";
        socket.emit('system message', {"room": localStorage.getItem('room'),"nickname": nickname,"old_nickname": nickname, 'date': date, "status" : status});
        localStorage.setItem('room', 'general');
        load_channel();
    };

    // Theme change
    document.querySelectorAll('.theme').forEach(link => {
        link.onclick = () => {
        
            // changing css file
            var oldlink = document.getElementsByTagName("link").item(4);
        
            var newlink = document.createElement("link");
            newlink.setAttribute("rel", "stylesheet");
            newlink.setAttribute("type", "text/css");
            newlink.setAttribute("href", `/static/styles/${link.dataset.page}.css`);
            
            // changing icon
            var oldico = document.getElementsByTagName("link").item(1);
    
            var newico = document.createElement("link");
            newico.setAttribute("rel", "icon");
            newico.setAttribute("href", `/static/image/bubbles/${link.dataset.page}_ico.ico`);
            
            // changing logo pngs
            document.getElementById("NavLogo").src = `../static/image/bubbles/${link.dataset.page}_png.png`;
            document.getElementById("ChangeLogo").src = `../static/image/bubbles/${link.dataset.page}_png.png`;
            document.getElementById("PrivateLogo").src = `../static/image/bubbles/${link.dataset.page}_png.png`;
            
            // conclusion
            document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
            document.getElementsByTagName("head").item(0).replaceChild(newico, oldico);
            }
    });

    

    // Adding Channels to channel list
    document.getElementById("add_channel").addEventListener ("click", submitChannel)
    document.getElementById("add_channel_form").addEventListener ("submit", submitChannel)
    
    function submitChannel(e) {
        e.preventDefault();
        // whitespace check
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
        
    });
    socket.on("load channel", data => {
        if (data['private'] == true){
            load_privates(data['room'])
        }
        load_comments(data.messages);
        
    })
    
    //Choosing Private sender
    document.querySelector('#plus_private_msg').onclick = () => {
        socket.emit("load users")
    }

    socket.on("load_users", data => {
        const pms = document.querySelectorAll('.pm_nickname');
        const username = localStorage.getItem('nickname');
        var exists = new Boolean(false);;

        
        if(pms.length  != data.length)
        {
            for(i = 0; i < data.length; i++)
            {

                if (data[i] != username)
                {
                    if(data[i] != "admin" && data[i] != 'tester')
                    {
                        const li = document.createElement('li');
                        for(j = 0; j < pms.length; j++)
                        {
                            if(data[i] == pms[j].innerHTML)
                            {
                                exists = true;
                            }
                        }
                        if(exists == false)
                        {
                            li.setAttribute('class', 'list_nickname')
                            li.setAttribute('data-page', data[i]);
                            li.innerHTML = data[i]
                            document.getElementById('ul_nicknames').appendChild(li);
                        }
                        exists = false;
                    }
                    
                }
            }            
        }
        else
        {
            const li = document.createElement('li');
            li.innerHTML = 'You have oppened all the messages';
            document.getElementById('ul_nicknames').appendChild(li);
        }
           
                
        $('#PrivateModalCenter').modal('show');
        load_pm();
    })

    // Clear modals on close
    $('#PrivateModalCenter').on('hidden.bs.modal', function () {
        document.getElementById('ul_nicknames').innerHTML = "";
    })
    $('#exampleModalCenter').on('hidden.bs.modal', function () {
        document.getElementById('join_name').value = "";
    })

    // Open & Close side nav
    document.querySelector('#openbtn').onclick = () => {
        openNav()
    };
    document.querySelector('#closebtn').onclick = () => {
        closeNav()
    };
    
    // Attachments in progress
    document.querySelector('.attachments').onclick = () => {
        alert("Attachments are in progress")
    }
});

// Adding Privates to the list
function load_pm() {
    document.querySelectorAll('.list_nickname').forEach(link => {
        link.onclick = () => {
            // Removing highlighting the room
            if(document.querySelector('.active')){
                document.querySelector('.active').classList.remove("active");
            }
            const nickname = localStorage.getItem('nickname');
            const nickname2 = link.dataset.page;
            const li = document.createElement('li');
            const newclass = "pm_"+ nickname2;

            li.setAttribute('class', 'pm_nickname');
            li.classList.add(newclass)
            li.setAttribute('data-page', nickname2);
            li.innerHTML = nickname2;
            document.getElementById('nickname_list_ul').append(li)

            
            
            $('#PrivateModalCenter').modal('hide');
            var ID = Math.random().toString(36).substr(2, 9);
            
            const old_room = localStorage.getItem('room')
            const private_room = nickname + "_" + ID + "_" + nickname2;
            document.querySelector(`.pm_${link.dataset.page}`).classList.add("active");
            socket.emit("load_privates", {"old_room": old_room,"room": private_room, 'nickname': nickname, 'nickname2' : nickname2});

            return false;
            
        };
    });
};

// Switching between channels
function load_channel() {
    document.querySelectorAll('.nav-link').forEach(link => {
        old_room = localStorage.getItem('room');
        document.querySelector(`.${localStorage.getItem('room')}`).classList.add("active");
        link.onclick = () => {
            // Highlighting the room
            if(document.querySelector('.active')){
                document.querySelector('.active').classList.remove("active");
            }
            document.querySelector(`.${link.dataset.page}`).classList.add("active");
            old_room = localStorage.getItem('room');
            localStorage.setItem('room', link.dataset.page);
            console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"));
            socket.emit("load_channel", {"old_room": old_room,"room": localStorage.getItem("room")});

            return false;
            
        };
        
    });
    socket.emit("load_channel", {"old_room": old_room,"room": localStorage.getItem("room")});
};

// Switching between Privates
function load_privates(data) {
    document.querySelectorAll('.pm_nickname').forEach(link => {
        localStorage.setItem('room', data)
        link.onclick = () => {
            // Highlighting the room
            if(document.querySelector('.active')){
                document.querySelector('.active').classList.remove("active");
            }
            document.querySelector(`.pm_${link.dataset.page}`).classList.add("active");
            nickname = localStorage.getItem('nickname');
            nickname2 = link.dataset.page;

            room = nickname + "_" + nickname2;
            old_room = localStorage.getItem('room');
            
            console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"));
            socket.emit("load_privates", {'nickname': nickname, 'nickname2': nickname2, "old_room": old_room,"room": room});

            return false;
            
        };
        
        
    });
};

function load_comments(data) {
    document.getElementById("messages").innerHTML = "";

    for(i = 0; i < data.length; i++)
    {
        if (data[i]['system'] == "system")
        {
            const system = document.createElement('span');
            system.setAttribute('class', 'system');
            if(data.status == "connect")
                system.innerHTML = `<p class="action"><strong>${data[i]['nickname']}</strong> has connected <span class="date">${data[i]['date']}</span></p>`
            if(data.status == "disconnect")
                system.innerHTML = `<p class="action"><strong>${data[i]['nickname']}</strong> has disconnected <span class="date">${data[i]['date']}</span></p>`        
        }
        else
        {
            const bubble = document.createElement('div');
            if(data[i]["nickname"] == localStorage.getItem('nickname'))
                bubble.setAttribute('class', 'bubble message_to');
            else
                bubble.setAttribute('class', 'bubble message_from');
            bubble.innerHTML = `<div class="heading"><p class="head_p"><strong class="head_s"> ${data[i]["nickname"]}</strong><span class="date"> ${data[i]["date"]}</span></p></div><div class="message"><p class="mess_p"> ${data[i]["text"]}</p></div>`
            document.getElementById('messages').appendChild(bubble);
        }
        
    }


    var objDiv = document.getElementById('messages');
            objDiv.scrollTop = objDiv.scrollHeight;
};

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("public_channels").style.width = "250px";
    document.getElementById("public_channels").style.padding = "10px";
    document.getElementById("public_channels").style.borderRight = "1px solid white";
    document.getElementById("chat").style.left = "250px";
  }
  
  /* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
  function closeNav() {
    document.getElementById("public_channels").style.width = "0px";
    document.getElementById("public_channels").style.padding = "0px";
    document.getElementById("public_channels").style.border = "0px";
    document.getElementById("chat").style.left = "0px";
  }
 
// Swipe detect  https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */
            console.log("Swipe left");
            if (screen.width < 667)
                closeNav();
        } else {
            /* right swipe */
            console.log("Swipe right");
            if (screen.width < 667)
                openNav();
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */
            console.log("Swipe up");
        } else { 
            /* down swipe */
            console.log("Swipe down");
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

