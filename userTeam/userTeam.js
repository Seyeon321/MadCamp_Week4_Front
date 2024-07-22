import ngrokUrl from "../ngrokUrl.js";

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded event triggered');
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('token'));

    if (!cookieValue) {
        console.error('No access token found in cookies');
        return; // 쿠키에 access token이 없으면 중단
    }

    const token = cookieValue.split('=')[1];
    console.log('token sent:', token);  // 쿠키에서 추출한 토큰 값을 로그로 출력
// ==============================token sent==============================
// ==============================create team - POST==============================
    const numInput = document.getElementById('teammate_num');
    const teammateOp = document.getElementById('teammate-options');

    numInput.addEventListener('focus', () => {
        teammateOp.style.display = 'block';
    }); //teammate_num의 input 요소 클릭 시 option이 block으로 display 됨

    document.addEventListener('click', (event) => {
        if(!numInput.contains(event.target) && !teammateOp.contains(event.target))
            teammateOp.style.display = 'none';
    }); //numInput이나 option외의 곳 클릭 시 block display 사라짐

    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', (event) => {
            const value = event.target.getAttribute('data-value');
            numInput.value = value;
            teammateOp.style.display = 'none';
        });
    }); //option들 중 클릭하면 해당 값 불러오기

    document.getElementById('button1').addEventListener('click', async () => {
        const week = document.getElementById('week').value;
        const code = document.getElementById('code').value;
        const teammateNum = document.getElementById('teammate_num').value;

        if (!week || !code || !teammateNum){
            console.error('Please fill in all the fields'); return;
        }

        try{
            const response = await fetch(`${ngrokUrl.url}/team/maketeam`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({week, code, teammate_num: teammateNum})
            });
            if(response.ok) console.log('Sent Team Info:', response);
            else console.error('Failed to fetch class info');
        } catch (error){
            console.error('Error fetching user info', error);
        }
    });

// ==============================join team - POST==============================
    document.getElementById('button2').addEventListener('click', async () => {
        const code = document.getElementById('join-code').value;

        try{
            const response = await fetch(`${ngrokUrl.url}/team/jointeam`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({code})
            });
            if(response.ok) console.log('Sent Code:', response);
            else console.error('Failed to fetch code');
        } catch (error){
            console.error('Error fetching code info', error);
        }
    });
// ==============================view my team - GET==============================
    const weekInput = document.getElementById('week2');
    const weekOp = document.getElementById('week-options');

    weekInput.addEventListener('focus', () => {
        weekOp.style.display = 'block';
    });

    document.addEventListener('click', (event) => {
        if(!weekInput.contains(event.target) && !weekOp.contains(event.target)){
            weekOp.style.display = 'none';
        }
    });

    document.querySelectorAll('.week-option').forEach(option => {
        option.addEventListener('click', (event) => {
            const value = event.target.getAttribute('data-value');
            weekInput.value = value;
            weekOp.style.display = 'none';
        });
    });

    async function loadTeamInfo(week2) {
        try {
            const response = await fetch(`${ngrokUrl.url}/team/teammates?week=${week2}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(response.ok) {
                const data = await response.json();
                const teamListContainer = document.querySelector('.team-list-container');
                teamListContainer.innerHTML = ''

                if (Array.isArray(data.teammates) && data.teammates.length > 0) {
                    data.teammates.forEach(teammate => {

                        const teammateElement = document.createElement('div');
                        teammateElement.className = 'teammate';

                        teammateElement.textContent = `Name: ${teammate}`;
                        teamListContainer.appendChild(teammateElement);

                    });
                } else {
                    const noTeammatesElement = document.createElement('div');
                    noTeammatesElement.className = 'no-teammates';
                    noTeammatesElement.textContent = 'No teammates found for the selected week.';
                    teamListContainer.appendChild(noTeammatesElement);
                }
            } else console.error('Failed to fetch team info');
        } catch (error) {
            console.error('Error fetching team info', error);
        }
    }

    document.getElementById('button3').addEventListener('click', () => {
        const selectedWeek = weekInput.value;
        if(selectedWeek) loadTeamInfo(selectedWeek);
        else console.error('Please select a week');
    });

});