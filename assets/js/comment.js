const apiUrl = 'https://your-api-id.amazonaws.com/comments';
const token = localStorage.getItem('id_token'); // 假設用戶已經登錄，存儲 ID Token

// 加載留言
async function loadComments() {
    const response = await fetch(apiUrl, {
        headers: {
            Authorization: token,
        },
    });
    const comments = await response.json();
    const commentsDiv = document.getElementById('comments');
    commentsDiv.innerHTML = comments
        .map((comment) => `
            <div class="comment">
                <h3>${comment.username}</h3>
                <p>${comment.message}</p>
                <small>${comment.timestamp}</small>
            </div>
        `)
        .join('');
}

// 提交留言
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('message').value;

    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        body: JSON.stringify({ message }),
    });

    loadComments();
});

// 頁面加載時載入留言
loadComments();