const API_URL = "https://duvtzrkm03.execute-api.us-east-1.amazonaws.com";

$(document).ready(function () {
    checkLoginState();

    // 切換到註冊畫面
    $("#show-register").click(function () {
        $("#login-section").hide();
        $("#register-section").show();
    });

    // 返回登入畫面
    $("#back-to-login").click(function () {
        $("#register-section").hide();
        $("#login-section").show();
    });

    // 註冊按鈕事件
    $("#register-btn").click(function () {
        const username = $("#register-username").val();
        const email = $("#register-email").val();
        const password = $("#register-password").val();

        $.ajax({
            url: `${API_URL}/register`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, email, password }),
            success: function (response) {
                alert("註冊成功，請登入！");
                $("#register-section").hide();
                $("#login-section").show();
            },
            error: function (xhr) {
                console.error("註冊失敗:", xhr.responseText);
                alert("註冊失敗：" + (xhr.responseJSON ? xhr.responseJSON.message : "請重試"));
            }
        });
    });

    // 登入按鈕事件
    $("#login-btn").click(function () {
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
            url: `${API_URL}/login`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: function (response) {
                alert("登入成功！");
                setCookie("username", username, 1);
                $("#welcome-username").text(username);
                $("#login-section").hide();
                $("#welcome-section").show();
            },
            error: function (xhr) {
                console.error("登入失敗:", xhr.responseText);
                alert("登入失敗：" + (xhr.responseJSON ? xhr.responseJSON.message : "請重試"));
            }
        });
    });

    // 登出按鈕事件
    $("#logout-btn").click(function () {
        deleteCookie("username");
        $("#welcome-section").hide();
        $("#login-section").show();
    });

    // 檢查登入狀態
    function checkLoginState() {
        const username = getCookie("username");
        if (username) {
            $("#welcome-username").text(username);
            $("#login-section").hide();
            $("#welcome-section").show();
        }
    }

    // 設置 Cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    // 取得 Cookie
    function getCookie(name) {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(`${name}=`)) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    }

    // 刪除 Cookie
    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
});