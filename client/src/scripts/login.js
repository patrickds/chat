$(document).ready(function () {

    var ENTER_KEY = 13;
    var loginPage = $('#login_page');
    var loginForm = $('#login_page form');
    var errorLabel = $('#error_label');
    var chatPage = $('#chat_page');
    var messagesList = $('#messages_list');

    loginForm.submit(function () {
        return false;
    });

    errorLabel.hide();
    chatPage.hide();
    //loginPage.hide();

    loginPage.keyup(function (e) {
        if (e.which != ENTER_KEY) return;

        var username = $('#username_input').val();

        var form = $('#login_page form');
        if (!validateUsername(username)) {

            errorLabel.fadeIn(300);
            form.addClass('has-error');
            return;
        }

        errorLabel.fadeOut(300);
        form.removeClass('has-error');

        initChat(username);

        loginPage.fadeOut(1000, function () {
            chatPage.fadeIn(500);
        });

        function validateUsername(username) {
            if (!username.trim())
                return false;

            return true;
        }
    });

    /* chat */

    function initChat(username) {
        var socket = socket = new io('http://192.168.10.181:2424');
        var chatForm = $('#chat_page form');
        var messageInput = $('#message_input');

        chatForm.submit(function () {
            return false;
        });
 
        socket.on('connect', function () {
            socket.emit('user connected', {
                user: username
            })
        });

        socket.on('new user', function (data) {
            messagesList.append(
                '<li class="user_connected">' +
                data.user + ' connected' +
                '</li>');
        });

        messageInput.keydown(function (e) {
            if (e.which != ENTER_KEY) return;

            var message = $(this).val();

            socket.emit('message', {
                user: username,
                msg: message
            });

            messagesList.append('<li tabindex="1" class="bubble"><strong>' +
                username +
                ':</strong> ' +
                message +
                '</li>'
                );
            scrollToLastMessage();
            $(this).val('');
        });

        socket.on('new message', function (data) {

            messagesList.append('<li tabindex="1" class="bubble2"><strong>' +
                data.user +
                ':</strong> ' +
                data.msg +
                '</li>'
                );
                
            playAudio();
            scrollToLastMessage();
        });
    };

    function playAudio() {
        var audio = new Audio('resources/tururu.mp3');
        audio.play();
    };

    function scrollToLastMessage() {
        
        var last = $('#messages_list li').last();
        messagesList.animate({ scrollTop: last.offset().top}, 0);
        console.log(last.offset().top);
    }
});