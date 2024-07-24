import ngrokUrl from "../ngrokUrl.js";

document.addEventListener('DOMContentLoaded', async function() {

    console.log('DOMContentLoaded event triggered');
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('token'));

    if (!cookieValue) {
        console.error('No access token found in cookies');
        return;
    }

    const token = cookieValue.split('=')[1];
    console.log('token sent:', token);

    try {
        const response = await fetch(`${ngrokUrl.url}/user/info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        console.log('response:', response);

        if (response.ok) {


            const userInfo = await response.json();
            document.getElementById('username').textContent = userInfo.username;
            document.getElementById('login_id').textContent = userInfo.login_id;
            document.getElementById('password').textContent = userInfo.password;
            document.getElementById('class_id').textContent = userInfo.class_id;
            document.getElementById('week').textContent = userInfo.week;
            document.getElementById('teammate').textContent = userInfo.teammate_name_list.join(' ');
            
        } else {
            console.error('Failed to fetch user info');
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }

    document.getElementById('edit-id-button').addEventListener('click', () => {
        document.getElementById('new-id').style.display = 'inline';
        document.getElementById('save-id-button').style.display = 'inline';
        document.getElementById('edit-id-button').style.display = 'none';
    });

    document.getElementById('save-id-button').addEventListener('click', async () => {
        const newId = document.getElementById('new-id').value
        try{
            const response = await fetch(`${ngrokUrl.url}/user/changeid`, {
                method: 'PUT',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                },
                body: JSON.stringify({new_login_id: newId})
            });

            if(response.ok) {
                document.getElementById('userId').textContent = newId;
                document.getElementById('new-id').style.display = 'none';
                document.getElementById('save-id-button').style.display = 'none';
                document.getElementById('edit-id-button').style.display = 'inline';
            } else {
                console.error('Failed to update ID');
            }
        } catch (error) {
            console.error('Error updating ID:', error);
        }
        location.reload();
    });

    document.getElementById('edit-password-button').addEventListener('click', () => {
        document.getElementById('new-password').style.display = 'inline';
        document.getElementById('save-password-button').style.display = 'inline';
        document.getElementById('edit-password-button').style.display = 'none';
    });

    document.getElementById('save-password-button').addEventListener('click', async () => {
        const newPassword = document.getElementById('new-password').value
        try{
            const response = await fetch(`${ngrokUrl.url}/user/changepassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                },
                body: JSON.stringify({new_password: newPassword})
            });

            if(response.ok) {
                document.getElementById('password').textContent = newPassword;
                document.getElementById('new-password').style.display = 'none';
                document.getElementById('save-password-button').style.display = 'none';
                document.getElementById('edit-password-button').style.display = 'inline';
            } else {
                console.error('Failed to update PW');
            }
        } catch (error) {
            console.error('Error updating PW:', error);
        }
        location.reload();
    });
});
