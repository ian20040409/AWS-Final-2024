(function($) {
    const App = {
        init: function() {
            this.bindUIActions();
            this.checkLoginState();
        },

        bindUIActions: function() {
            $('#loginForm').submit(this.handleLogin);
            $('#registerForm').submit(this.handleRegister);
            $('#logoutButton').click(this.handleLogout);
            $('#commentForm').submit(this.handleCommentSubmit);
        },

        handleLogin: function(e) {
            e.preventDefault();
            const username = $('#loginUsername').val();
            const password = $('#loginPassword').val();

            $.ajax({
                url: 'https://duvtzrkm03.execute-api.us-east-1.amazonaws.com/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, password }),
                success: function(response) {
                    alert('登入成功');
                    App.setCookie('username', username, 1); // 儲存用戶名至 Cookie
                    App.updateUIAfterLogin(username);
                    App.getComments();
                },
                error: function(xhr) {
                    console.error('登入失敗:', xhr.responseText);
                    alert(xhr.responseJSON ? xhr.responseJSON.message : '登入失敗');
                }
            });
        },

        handleRegister: function(e) {
            e.preventDefault();
            const username = $('#registerUsername').val();
            const email = $('#registerEmail').val();
            const password = $('#registerPassword').val();

            $.ajax({
                url: 'https://duvtzrkm03.execute-api.us-east-1.amazonaws.com/register',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, email, password }),
                success: function(response) {
                    alert('註冊成功，請登入');
                    $('#register-section').hide();
                    $('#login-section').show();
                },
                error: function(xhr) {
                    console.error('註冊失敗:', xhr.responseText);
                    alert(xhr.responseJSON ? xhr.responseJSON.message : '註冊失敗');
                }
            });
        },

        handleLogout: function() {
            App.deleteCookie('username'); // 清除 Cookie
            alert('已登出');
            App.resetUIAfterLogout();
        },

        handleCommentSubmit: function(e) {
            e.preventDefault();
            const comment = $('#message').val();
            const username = App.getCookie('username'); // 從 Cookie 獲取用戶名
            const url = window.location.href;

            if (!username) {
                alert('請先登入');
                return;
            }

            $.ajax({
                url: 'https://duvtzrkm03.execute-api.us-east-1.amazonaws.com/comments',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, url, comment }),
                success: function() {
                    alert('留言提交成功');
                    $('#message').val('');
                    App.getComments();
                },
                error: function(xhr) {
                    console.error('留言提交失敗:', xhr.responseText);
                    alert(xhr.responseJSON ? xhr.responseJSON.message : '留言提交失敗');
                }
            });
        },

        getComments: function() {
            const url = window.location.href;

            $.ajax({
                url: `https://duvtzrkm03.execute-api.us-east-1.amazonaws.com/comments?url=${encodeURIComponent(url)}`,
                method: 'GET',
                dataType: 'json',
                success: function(response) {
                    $('#comments').empty();
                    if (response.comments && Array.isArray(response.comments)) {
                        response.comments.forEach(comment => {
                            $('#comments').append(`
                                <p><strong>${comment.username}:</strong> ${comment.comment} <em>(${comment.created_at})</em></p>
                            `);
                        });
                    } else {
                        $('#comments').append('<p>目前沒有留言。</p>');
                    }
                },
                error: function(xhr) {
                    console.error('獲取留言失敗:', xhr.responseText);
                    alert('無法獲取留言');
                }
            });
        },

        checkLoginState: function() {
            const username = App.getCookie('username'); // 從 Cookie 獲取用戶名
            if (username) {
                App.updateUIAfterLogin(username);
            }
            App.getComments(); // 無論登入與否，顯示留言
        },

        updateUIAfterLogin: function(username) {
            $('#login-section').hide();
            $('#register-section').hide();
            $('#user-info').show();
            $('#currentUsername').text(username);
            $('#comments-section').show();
            $('#comment-input').show(); // 顯示留言輸入框
        },

        resetUIAfterLogout: function() {
            $('#user-info').hide();
            $('#comments-section').show();
            $('#comment-input').hide(); // 隱藏留言輸入框
            $('#login-section').show();
        },

        // Cookie 操作方法
        setCookie: function(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/`;
        },

        getCookie: function(name) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(`${name}=`)) {
                    return cookie.substring(name.length + 1);
                }
            }
            return null;
        },

        deleteCookie: function(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        }
    };

    $(document).ready(function() {
        App.init();
    });

})(jQuery);