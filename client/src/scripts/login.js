$(document).ready(function () {

    var loginPage = $('#login_page'),
        errorLabel = $('#error_label'),
        chatPage = $('#chat_page'),
        messages = $('#messages'),
        soundButton = $('#sound_button'),
        loginForm = $('#login_page form');

    var serverUrl = 'http://192.168.10.181:2424';
    var ENTER_KEY = 13;
    var muted = false;

    invalidateFormsSubmit();
    hideWhatShouldBeHidden();
    var username;
    var socket = socket = new io(serverUrl);

    soundButton.click(function () {
        muted = !muted;
        updateSoundIcon();
    });
    
    /************* login *****************/

    loginPage.keyup(function (e) {
        if (e.which == ENTER_KEY) {
            username = $('#username_input').val();
            socket.emit('validate user', { user: username });
        }
    });
    
    /************* login *****************/

    /************* main chat *****************/
    function initializeChat() {

        var messageInput = $('#message_input');

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
    }
    /************* main chat *****************/

    /************* Socket Events *****************/

    socket.on('valid user', function () {
        errorLabel.fadeOut(300);
        loginForm.removeClass('has-error');

        initializeChat();

        loginPage.fadeOut(1000, function () {
            chatPage.fadeIn(500);
        });

        addUser();
    })

    socket.on('invalid user', function () {
        showLoginError('This username already exists.')
    })

    socket.on('empty user', function () {
        showLoginError('User cannot be empty.')
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

    socket.on('reconnecting', function (count) {
        alert('Reconnecting to server'); 
    })
    
    /************* Socket Events *****************/

    /************* utils functions *****************/

    function showLoginError(msg) {
        errorLabel.text(msg);
        errorLabel.fadeIn(300);
        loginForm.addClass('has-error');
    }

    function addUser() {
        var notificationData = { notification: 'connected', user: username };
        var notificationElement = buildNotification(notificationData);

        addElementIntoChat(notificationElement);
    }

    function hideWhatShouldBeHidden() {
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
        var usernameDiv = $('<span id="username"/>')
            .text(data.user);

        var messageBodyDiv = $('<span id="message"/>')
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

    function updateSoundIcon() {
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