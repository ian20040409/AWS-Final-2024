        const API_URL = "https://duvtzrkm03.execute-api.us-east-1.amazonaws.com";
        const currentUrl = window.location.href;

        $(document).ready(function () {
            // 提交留言
            $("#commentForm").submit(function (e) {
                e.preventDefault();
                const comment = $("#message").val().trim();
                if (!comment) {
                    alert("請輸入留言內容！");
                    return;
                }

                $.ajax({
                    url: `${API_URL}/comments`,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        comment_id: Date.now().toString(),
                        comment: comment,
                        url: currentUrl
                    }),
                    success: function () {
                        alert("留言提交成功！");
                        $("#message").val("");
                        loadComments();
                    },
                    error: function (xhr) {
                        alert("留言提交失敗：" + xhr.responseText);
                    }
                });
            });

            // 載入留言
            function loadComments() {
                $.ajax({
                    url: `${API_URL}/comments?url=${encodeURIComponent(currentUrl)}`,
                    method: "GET",
                    success: function (response) {
                        $("#comments-list").empty();
                        const comments = JSON.parse(response).comments;

                        if (comments.length > 0) {
                            comments.forEach(c => {
                                $("#comments-list").append(`
                                    <div class="comment">
                                        <div class="avatar">
                                            <img src="assets/user.png" alt="User Avatar">
                                        </div>
                                        <div class="comment-content">
                                            <h3 class="username">匿名使用者</h3>
                                            <p class="message">${escapeHtml(c.comment)}</p>
                                            <small class="text-muted">時間: ${formatDate(c.created_at)}</small>
                                        </div>
                                    </div>
                                `);
                            });
                        } else {
                            $("#comments-list").html("<p>目前沒有留言。</p>");
                        }
                    },
                    error: function () {
                        alert("加載留言失敗");
                    }
                });
            }

            // 初始化加載留言
            loadComments();

            // 防止 XSS 攻擊的函數
            function escapeHtml(text) {
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
        });
