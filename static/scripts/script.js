document.addEventListener('DOMContentLoaded', () => {


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    console.log("Room LocalStorage is: "+ localStorage.getItem("room"))
    if (localStorage.getItem('room') == null){
        localStorage.setItem('room', 'general');
        console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"))
        }

    // Var for months
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    // When connected, configure buttons
    socket.on('connect', () => {

        if (localStorage.getItem('nickname') !== null){
            const status = "connect"
            const nickname = localStorage.getItem('nickname');
            const today = new Date()
            const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
            socket.emit('system message', {"nickname": nickname, "old_nickname": nickname,'date': date, "status" : status});
            
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
        // document.querySelector(`.${localStorage.getItem('room')}`).classList.add("active");
        console.log(localStorage.getItem('room'))
        load_channel(localStorage.getItem('room'));
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
            socket.emit('system message', {"nickname": nickname,"old_nickname": nickname, 'date': date, "status" : status});
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
        if(data.status == "disconnect")
            system.innerHTML = `<p class="action"><strong>${data.nickname}</strong> has disconnected <span class="date">${data.date}</span></p>`        
        if(data.status == "change")
            system.innerHTML = `<p class="action"><strong>${data.old_nickname}</strong> is now known as <strong>${data.nickname}</strong> <span class="date">${data.date}</span></p>`        

        var objDiv = document.getElementById('messages');
        objDiv.appendChild(system);
        objDiv.scrollTop = objDiv.scrollHeight;
    });

    // joib registration button is disabled
    document.querySelector('#join').disabled = true;

    // Registering if new
    if(!localStorage.getItem('nickname'))
        $('#exampleModalCenter').modal('show');
    else
    {
        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
    }

    // Changing Nickname
    document.querySelector("#display_nickname").onmouseover = () => {
        document.querySelector("#display_nickname").innerHTML = "Change";
    }
    document.querySelector("#display_nickname").onmouseout = () => {
        document.querySelector("#display_nickname").innerHTML = localStorage.getItem("nickname");
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
    
    // Registration submit
    document.querySelector('#join').onclick = () => {
        const nickname  = document.getElementById("join_name").value
        localStorage.setItem('nickname', nickname);

        socket.emit('registering user', {'user': document.querySelector('#join_name').value});


        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
        const today = new Date()
        const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
        const status = "connect";
        socket.emit('system message', {"nickname": nickname,"old_nickname": nickname, 'date': date, "status" : status});
    };

    // Change Nickname check
    document.querySelector('#change_name').onkeyup = () => {
        
        document.getElementById("change").setAttribute("data-dismiss", "none");
        const whitespace = document.querySelector('#change_name').value.indexOf(' ');
        const alt = document.querySelector('#change_name').value.indexOf(" ");   
        
        if (alt >= 0){
            document.getElementById('error-mesage-registration2').style.display='block';
            document.getElementById('error-mesage-registration2').innerHTML='Please remove all nbsp :)';
            
        }
        if (whitespace >= 0){
            document.getElementById('error-mesage-registration2').style.display='block';
            document.getElementById('error-mesage-registration2').innerHTML='Please remove all spaces';
        }

        if (alt < 0 && whitespace < 0){
            if (document.querySelector('#change_name').value.length > 0){
                socket.emit('new user', {'user': document.querySelector('#change_name').value});
            }
                   
            else
                document.querySelector('#change').disabled = true;
        }
        socket.on('user exists', () => {
            console.log("soket.on USER EXISTS");
            document.getElementById('error-mesage-registration2').innerHTML='User exists';
            document.getElementById('error-mesage-registration2').style.display='block';
            document.querySelector('#change').disabled = true;
        });
    
        socket.on('register OK', () => {
            console.log("REGISTER OK");
            document.getElementById("change").setAttribute("data-dismiss", "modal");
            document.getElementById('error-mesage-registration2').style.display='none';
            document.querySelector('#change').disabled = false;
        });
    
    };
    
    //Change Nickname Submit
    document.querySelector('#change').onclick = () => {
        const new_nickname  = document.getElementById("change_name").value
        const old_nickname = localStorage.getItem('nickname');
        localStorage.setItem('nickname', new_nickname);

        // Changing username in python
        socket.emit('changing user', {"old_nickname": old_nickname,  'new_nickname': new_nickname});

        // Changing username in javascript
        const bubbles = document.querySelectorAll(".bubble")
            for(i = 0; i < bubbles.length; i++){
                if (document.querySelectorAll(".head_s")[i]["innerText"] == old_nickname){
                    document.querySelectorAll(".head_s")[i].innerHTML = new_nickname;
                }
            }
        document.querySelector('#display_nickname').innerHTML = localStorage.getItem('nickname');
        const today = new Date()
        const date = today.getDate()+' '+months[today.getMonth()]+' '+today.getHours() + ":" + (today.getMinutes()<10?'0':'') + today.getMinutes();
        const status = "change";
        console.log("old_nickname is "+old_nickname);
        socket.emit('system message', {"nickname": new_nickname, "old_nickname": old_nickname, 'date': date, "status" : status});
    };

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
        
    });
    socket.on("load channel", data => {
        console.log("loaded channel start");
        console.log(data);
        load_comments(data.messages);
        
    })
    // Open & Close side nav
    document.querySelector('#openbtn').onclick = () => {
        openNav()
    };
    document.querySelector('#closebtn').onclick = () => {
        closeNav()
    }
});

// Switching between channels
function load_channel() {
    document.querySelectorAll('.nav-link').forEach(link => {
        document.querySelector(`.${localStorage.getItem('room')}`).classList.add("active");
        link.onclick = () => {
            // Highlighting the room
            if(document.querySelector('.active')){
                document.querySelector('.active').classList.remove("active");
            }
            document.querySelector(`.${link.dataset.page}`).classList.add("active");
            localStorage.setItem('room', link.dataset.page);
            console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"));
            
            var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
            socket.emit("load_channel", {"room": localStorage.getItem("room")});
            
            return false;
            
        };
        
    });
};
function load_comments(data) {
    document.querySelector("#messages").html= data;


    


    var objDiv = document.getElementById(localStorage.getItem('room'));
            objDiv.scrollTop = objDiv.scrollHeight;
    console.log("NOW Room LocalStorage is: "+ localStorage.getItem("room"));
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

