const API_URL = "https://duvtzrkm03.execute-api.us-east-1.amazonaws.com";
const currentUrl = window.location.href;

$(document).ready(function () {
    // 函數：根據名稱獲取 Cookie 的值
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i=0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                console.log(`取得 Cookie - ${name}:`, value);
                return value;
            }
        }
        console.log(`Cookie ${name} 未找到`);
        return null;
    }

    // 防止 XSS 攻擊的函數
    function escapeHtml(text) {
        if (typeof text !== 'string') {
            console.warn('escapeHtml 接收到非字串:', text);
            return '';
        }
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 格式化日期的函數
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    // 提交留言
    $("#commentForm").submit(function (e) {
        e.preventDefault();
        const comment = $("#message").val().trim();
        if (!comment) {
            alert("請輸入留言內容！");
            return;
        }

        const username = getCookie("username") || "匿名使用者"; // 從 Cookie 獲取使用者名稱，若無則設為匿名
        console.log("提交留言的使用者名稱:", username);
        console.log("提交的留言內容:", comment);

        $.ajax({
            url: `${API_URL}/comments`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                comment_id: Date.now().toString(),
                username: username, // 添加使用者名稱
                comment: comment,
                url: currentUrl
            }),
            success: function () {
                console.log("留言提交成功");
                alert("留言提交成功！");
                $("#message").val("");
                loadComments();
            },
            error: function (xhr) {
                console.error("留言提交失敗:", xhr.responseText);
                alert("留言提交失敗：" + xhr.responseText);
            }
        });
    });

    // 載入留言
/*************  ✨ Codeium Command ⭐  *************/
            /**
             *  error callback for $.ajax
             *
             *  If the AJAX request fails, show an alert dialog with a message.
             */
/******  ee8a09b9-c916-4cf1-9c2c-f703e9b0accb  *******/    function loadComments() {
        $.ajax({
            url: `${API_URL}/comments?url=${encodeURIComponent(currentUrl)}`,
            method: "GET",
            dataType: 'json', // 確保回應被解析為 JSON
            success: function (response) {
                console.log('AJAX 回應：', response);
                $("#comments-list").empty();
                const comments = response.comments;

                if (comments && comments.length > 0) {
                    comments.forEach(c => {
                        console.log("顯示留言:", c);
                        const username = c.username || "匿名使用者";
                        const comment = c.comment || "";
                        const created_at = c.created_at || "";

                        $("#comments-list").append(`
                            <div class="comment">
                                <div class="avatar">
                                    <img src="assets/user.png" alt="User Avatar">
                                </div>
                                <div class="comment-content">
                                    <h3 class="username">${escapeHtml(username)}</h3>
                                    <p class="message">${escapeHtml(comment)}</p>
                                    <small class="text-muted">時間: ${formatDate(created_at)}</small>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    console.log("沒有留言");
                    $("#comments-list").html("<p>目前沒有留言。</p>");
                }
            },
            error: function (xhr) {
                console.error("加載留言失敗:", xhr.responseText);
                alert("加載留言失敗");
            }
        });
    }

    // 初始化加載留言
    loadComments();
});