$(document).ready(function () {

    var loginPage = $('#login_page'),
        errorLabel = $('#error_label'),
        chatPage = $('#chat_page'),
        messages = $('#messages'),
        soundButton = $('#sound_button');

    var serverUrl = 'localhost:2424';
    var ENTER_KEY = 13;
    var muted = false;

    invalidateFormsSubmit();
    hideWhatShouldBeHidden();
    
    /************* login *****************/

    loginPage.keyup(function (e) {
        if (e.which != ENTER_KEY) return;

        var username = $('#username_input').val();

        var loginForm = $('#login_page form');
        if (!validateUsername(username)) {

            errorLabel.fadeIn(300);
            loginForm.addClass('has-error');
            return;
        }

        errorLabel.fadeOut(300);
        loginForm.removeClass('has-error');

        initChat(username);

        loginPage.fadeOut(1000, function () {
            chatPage.fadeIn(500);
        });
    });
    /************* login *****************/

    /************* main chat *****************/
    function initChat(username) {
        var socket = socket = new io(serverUrl);
        var messageInput = $('#message_input');
        
        soundButton.click(function () {           
            muted = !muted;
            changeSoundIcon();
        });
        
        messageInput.keyup(function (e) {
            if (e.which != ENTER_KEY)
                return;

            var message = cleanInput($(this).val());

            if (isMessageValid(message)) {
                var messageData = { user: username, msg: message };
                socket.emit('message', messageData);
                addElementIntoChat(buildSentMessage(messageData));
                resetElement($(this));
            }
        });
        /************* main chat *****************/
        
        /************* Socket Events *****************/
        socket.on('connect', function () {
            socket.emit('user connected', { user: username });
        });

        socket.on('new user', function (data) {
            var notificationData = { notification: 'connected', user: data.user };
            var notificationElement = buildNotification(notificationData);

            addElementIntoChat(notificationElement);
        });

        socket.on('user disconnected', function (data) {
            var notificationData = { notification: 'disconnected', user: data.user };
            var notificationElement = buildNotification(notificationData);

            addElementIntoChat(notificationElement);
        });

        socket.on('new message', function (data) {
            var messageDiv = buildReceivedMessage(data);

            addElementIntoChat(messageDiv);
            notify();
        });
        /************* Socket Events *****************/
    }

    /************* utils functions *****************/

    function validateUsername(username) {
        if (!username.trim())
            return false;

        return true;
    }

    function hideWhatShouldBeHidden() {
        errorLabel.hide();
        chatPage.hide();
        // loginPage.hide();
    }

    function invalidateFormsSubmit() {
        $('form').submit(function () { return false; });
    }

    function resetElement(element) {
        element.val('');
    }

    function buildNotification(notificationData) {
        return $('<li class="notification"/>')
            .text(notificationData.user + ' ' + notificationData.notification);
    }

    function buildReceivedMessage(data) {
        var messageDiv = buildMessage(data);
        messageDiv.addClass('message_received');

        return messageDiv;
    }

    function buildSentMessage(data) {
        var messageDiv = buildMessage(data);
        messageDiv.addClass('message_sent');

        return messageDiv;
    }

    function buildMessage(data) {

        var usernameDiv = $('<span id="username" class="span_block"/>')
            .text(data.user);

        var messageBodyDiv = $('<span id="message" class="span_block"/>')
            .text(data.msg);

        return $('<li/>').append(usernameDiv).append(messageBodyDiv);
    }

    function addElementIntoChat(messageDiv) {

        var lastMessage = $('#messages li').last();
        var lastUser = $('#messages #username').last().text();
        var currentUser = messageDiv.children('#username').text();

        if (!lastMessage.hasClass('notification') && !messageDiv.hasClass('notification') && (lastUser && lastUser == currentUser)) {
            var newMessageSpan = messageDiv.children('#message');
            lastMessage.append(newMessageSpan);
        }
        else {
            messages.append(messageDiv);
        }

        scrollToLastMessage();
    }

    function changeSoundIcon() {     
        if (muted) {
            soundButton.removeClass('glyphicon-volume-up');
            soundButton.addClass('glyphicon-volume-off');
        }
        else {
            soundButton.removeClass('glyphicon-volume-off');
            soundButton.addClass('glyphicon-volume-up');
        }
    }

    function notify() {
        blinkWindow();
        bleep();
    }

    function blinkWindow() {
        //TODO:
    }

    function bleep() {
        if (!document.hasFocus() && !muted) {
            var audio = new Audio('resources/bleep.mp3');
            audio.play();
        }
    }

    function scrollToLastMessage() {
        if (shouldScroll()) {
            messages[0].scrollTop = messages[0].scrollHeight;
        }
    }

    function isMessageValid(message) {
        if (!message.trim())
            return false;
        return true;
    }

    function cleanInput(input) {
        // return input.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // replace < for html encoded < and so on
        // return $( $.parseHTML(input)).text(); // remove all invalid chars
        return input;
    }

    function shouldScroll() {
        var tolerance = 100; //TODO: tolerance should be the sum of the two last LI height 
        var messagesListHeight = messages.height() + messages[messages.length - 1].scrollTop;
        var distanceFromFirstMessage = messages[0].scrollHeight;

        return distanceFromFirstMessage - tolerance <= messagesListHeight;
    }
    /************* utils functions *****************/
});