import ngrokUrl from "../ngrokUrl.js";

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const login_id = document.getElementById('login_id').value;
    const password = document.getElementById('password').value;

    console.log('Sent login_id:', login_id);
    console.log('Sent Password:', password);

    try {

        const response = await fetch(`${ngrokUrl.url}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login_id, password })
        });

        const result = await response.json();

        console.log('Response result:', result); // 응답 결과 출력

        if (response.ok) {
            document.cookie = `token=${result.token}; path=/`;
            document.cookie = `username=${result.username}; path=/`;
            document.cookie = `is_admin=${result.is_admin}; path=/`;

            if (!result.is_admin) // is_admin이 false라면 == 접속 client가 학생이면
                window.location.href = '/userInfo/userInfo.html';
            else // is_admin이 true라면 == 접속 clinet가 admin이면
                window.location.href = '/adminSetting/adminSetting.html';

        } else {
            document.getElementById('error-message').innerText = result.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error during fetch:', error); // 에러 상세 정보 출력
        document.getElementById('error-message').innerText = 'An error occurred. Please try again.';
    }
});
