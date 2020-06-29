document.addEventListener('DOMContentLoaded', () => {


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        // Each button should emit a "submit vote" event
        document.querySelector('.submit_message').onclick = () => {
                const text = document.querySelector('.type_message').value;
                const nickname = localStorage.getItem('nickname');
                Date.now = function() { return new Date().getTime();}
                const date = Math.floor(Date.now() / 1000);
                socket.emit('submit comment', {'text': text, 'nickname': nickname, 'date': date});
            };
    });


    // When a new vote is announced, add to the unordered list
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
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
 
    };
});