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
            if(response.ok) {
                document.getElementById("maketeam_warning").textContent = "팀 만들기 성공"
                document.getElementById("maketeam_warning").style.color = 'black'

            }
            else {
                document.getElementById("maketeam_warning").textContent = await response.text();
                document.getElementById("maketeam_warning").style.color = 'red';
                console.log("status code:", await response.text())
            }
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
            if(response.ok){
                document.getElementById("jointeam_warning").textContent = "팀 참여 성공"
                document.getElementById("jointeam_warning").style.color = 'black'

            }
            else {
                document.getElementById("jointeam_warning").textContent = await response.text();
                document.getElementById("jointeam_warning").style.color = 'red';
                console.log("status code:", await response.text())
            }
        } catch (error){
            console.error('Error fetching code info', error);
        }
    });
// ==============================view my team - GET==============================


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
                var returnStr = ""

                if (Array.isArray(data.teammates) && data.teammates.length > 0) {
                    data.teammates.forEach(teammate => {
                    returnStr += teammate
                    });
                } else {
                    returnStr = "아직 팀원이 없습니다"
                }
                document.getElementById(`teammate ${week2}`).textContent = returnStr
            } else console.error('Failed to fetch team info');
        } catch (error) {
            console.error('Error fetching team info', error);
        }
    }



    async function updateTeammates() {
        for (let i = 1; i < 5; i++) {
            const teammate = await loadTeamInfo(i);
        }
    }
    
    // Call the function with the selected week
    updateTeammates();
    

});
