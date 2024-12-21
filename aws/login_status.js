$(document).ready(function () {
    checkLoginStatus();

    // 檢查登入狀態
    function checkLoginStatus() {
        const username = getCookie("username");
        if (username) {
            // 如果已登入，顯示歡迎訊息和登出按鈕
            $("#status-content").html(`
                <p>👋 歡迎，<strong>${username}</strong>！</p>
                <button id="logout-btn" class="button">登出</button>
            `);
        } else {
            // 如果未登入，顯示登入和註冊按鈕
            $("#status-content").html(`
                <p>您尚未登入。</p>
                <a href="login.html" class="button">登入</a>
                <a href="login.html" class="button">註冊</a>
            `);
        }
    }

    // 登出按鈕事件
    $(document).on('click', '#logout-btn', function () {
        deleteCookie("username");
        alert("已登出！");
        location.reload();
    });

    // 設置 Cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    // 取得 Cookie
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(`${name}=`)) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
        return null;
    }

    // 刪除 Cookie
    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
});