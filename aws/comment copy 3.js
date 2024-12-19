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
        if (!timestamp) return "";
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

        const username = getCookie("username"); // 不再默認為「匿名使用者」
        if (!username) {
            alert("請先登入才能提交留言！");
            return;
        }
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
                alert("留言提交失敗：" + (xhr.responseJSON ? xhr.responseJSON.message : "請重試"));
            }
        });
    });

    // 編輯留言
    function editComment(commentId) {
        // 找到相應的留言元素
        const commentDiv = $(`.comment[data-id="${commentId}"]`);
        const messagePara = commentDiv.find(".message");
        const currentMessage = messagePara.text();

        // 替換留言內容為編輯表單
        messagePara.html(`<textarea class="edit-message">${escapeHtml(currentMessage)}</textarea>`);
        
        // 替換編輯按鈕為保存和取消按鈕
        const actionsDiv = commentDiv.find(".comment-actions");
        actionsDiv.html(`
            <button class="save-btn" data-id="${commentId}">保存</button>
            <button class="cancel-btn" data-id="${commentId}">取消</button>
        `);

        // 綁定保存和取消按鈕的事件
        $(".save-btn").click(function() {
            const id = $(this).data("id");
            saveEdit(id);
        });

        $(".cancel-btn").click(function() {
            const id = $(this).data("id");
            cancelEdit(id);
        });
    }

    // 保存編輯
    function saveEdit(commentId) {
        const commentDiv = $(`.comment[data-id="${commentId}"]`);
        const newMessage = commentDiv.find(".edit-message").val().trim();

        if (!newMessage) {
            alert("留言內容不能為空！");
            return;
        }

        const username = getCookie("username");
        if (!username) {
            alert("請先登入才能編輯留言！");
            return;
        }

        $.ajax({
            url: `${API_URL}/comments/${commentId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                comment: newMessage
            }),
            success: function () {
                console.log("留言編輯成功");
                alert("留言編輯成功！");
                loadComments();
            },
            error: function (xhr) {
                console.error("留言編輯失敗:", xhr.responseText);
                alert("留言編輯失敗：" + (xhr.responseJSON ? xhr.responseJSON.message : "請重試"));
            }
        });
    }

    // 取消編輯
    function cancelEdit(commentId) {
        loadComments();
    }

    // 刪除留言
    function deleteComment(commentId) {
        if (confirm("您確定要刪除此留言嗎？")) {
            const username = getCookie("username");
            if (!username) {
                alert("請先登入才能刪除留言！");
                return;
            }

            $.ajax({
                url: `${API_URL}/comments/${commentId}`,
                method: "DELETE",
                contentType: "application/json",
                data: JSON.stringify({
                    username: username
                }),
                success: function () {
                    console.log("留言刪除成功");
                    alert("留言刪除成功！");
                    loadComments();
                },
                error: function (xhr) {
                    console.error("留言刪除失敗:", xhr.responseText);
                    alert("留言刪除失敗：" + (xhr.responseJSON ? xhr.responseJSON.message : "請重試"));
                }
            });
        }
    }

    // 載入留言
    function loadComments() {
        const currentUser = getCookie("username"); // 獲取當前用戶名稱
        const isLoggedIn = !!currentUser; // 判斷用戶是否登入

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
                        const commentUser = c.username || "匿名使用者";
                        const comment = c.comment || "";
                        const created_at = c.created_at || "";
                        const comment_id = c.comment_id || "";

                        // 判斷是否為當前用戶的留言
                        const isOwner = isLoggedIn && (commentUser === currentUser);

                        // 構建編輯和刪除按鈕（僅對擁有者顯示）
                        const editButton = isOwner ? `<button class="edit-btn" data-id="${comment_id}">編輯</button>` : "";
                        const deleteButton = isOwner ? `<button class="delete-btn" data-id="${comment_id}">刪除</button>` : "";

                        $("#comments-list").append(`
                            <div class="comment" data-id="${comment_id}">
                                <div class="avatar">
                                    <img src="assets/user.png" alt="User Avatar">
                                </div>
                                <div class="comment-content">
                                    <h3 class="username">${escapeHtml(commentUser)}</h3>
                                    <p class="message">${escapeHtml(comment)}</p>
                                    <small class="text-muted">時間: ${formatDate(created_at)}</small>
                                    <div class="comment-actions">
                                        ${editButton}
                                        ${deleteButton}
                                    </div>
                                </div>
                            </div>
                        `);
                    });

                    // 綁定編輯和刪除按鈕的事件
                    $(".edit-btn").click(function() {
                        const commentId = $(this).data("id");
                        editComment(commentId);
                    });

                    $(".delete-btn").click(function() {
                        const commentId = $(this).data("id");
                        deleteComment(commentId);
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