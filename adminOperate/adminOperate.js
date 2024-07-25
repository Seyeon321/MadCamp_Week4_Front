import ngrokUrl from "../ngrokUrl.js";

document.addEventListener('DOMContentLoaded', async function() {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('token'));

    if (!cookieValue) {
        console.error('No access token found in cookies');
        return;
    }

    const token = cookieValue.split('=')[1];
    console.log('token sent:', token);

    let currentClassId = null;
    let currentWeek = null;
//==============================token sent==============================
//==============================backend에서 set order==============================
    async function setOrder(classId, week) {
        try {
            const response = await fetch(`${ngrokUrl.url}/admin/operate/setorder`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({class_id: classId, week})
            });
            if (response.ok) {
                currentClassId = classId;
                currentWeek = week;
                showOrder();
            } else {
                console.error('Failed to set order');
            }
        } catch (error) {
            console.error('Error setting order', error);
        }
    }
//==============================투표 시작하기 버튼 - PUT==============================
    async function startReview() {
        if (!currentClassId || !currentWeek) {
            console.error('Class ID and Week are not set');
            return;
        }

        try {
            const response = await fetch(`${ngrokUrl.url}/admin/operate/startreview`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({class_id: currentClassId, week: currentWeek})
            });
            if (response.ok) {
                console.log('Review started successfully');
            } else {
                console.error('Failed to start review');
            }
        } catch (error) {
            console.error('Error starting review:', error);
        }
    }
//==============================front에서 order 보여주기==============================
    async function showOrder() {
        if (!currentClassId || !currentWeek) {
            console.error('Class ID and Week are not set');
            return;
        }

        try {
            const response = await fetch(`${ngrokUrl.url}/teamlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({class_id: currentClassId, week: currentWeek})
            });
            const orderListContainer = document.getElementById('order-list-container');
            orderListContainer.innerHTML = '';
            if (response.ok) {
                const data = await response.json();

                if(data.team_list && data.team_list.length > 0) {
                    data.team_list.forEach(team => {
                        const teamRow = document.createElement('div');
                        teamRow.className = 'team';
                        let students = team.student_name_list.map(name => `${name}`).join(' & ')
                        teamRow.textContent = students
                        console.log(students)
                        orderListContainer.appendChild(teamRow);
                    });
                } else orderListContainer.textContent = '순서를 생성해주세요';
            } else console.error('Failed to fetch order');
        } catch (error) {
            console.error('Error fetching order:', error);
        }
    }
//==============================금픽 결과 보여주기==============================
    async function showResults(){
        if(!currentClassId || !currentWeek){
            console.error('Class ID and Week are not set');
            return;
        }

        try {
            const response = await fetch(`${ngrokUrl.url}/admin/operate/calculate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({class_id: currentClassId, week: currentWeek})
            });
            const rightContainer = document.getElementById('lower-container');
            rightContainer.innerHTML = '';
            if (response.ok) {
                const data = await response.json();
                const sortedTeams = data.sortedTeams;

                if (sortedTeams && sortedTeams.length > 0) {
                    rightContainer.innerHTML = 
                    `<div class="title-section1">
                        <h1>${currentWeek}주 금픽 팀</h1>
                    </div>`;
                    sortedTeams.slice(0, 2).forEach(team => {
                        const teamRow = document.createElement('div');
                        teamRow.className = 'selected-team';
                        let students = team.team_member_list.map(name => `${name}`).join(' & ')
                        teamRow.textContent = students
                        console.log(students)
                        rightContainer.appendChild(teamRow);

                    });
                }else rightContainer.textContent = '결과를 가져올 수 없습니다.';
            } else {
                console.error('Failed to fetch results');
            }
        } catch (error) {
            console.error('Error fetching results', error);
        }
    }
//============================================================
    document.getElementById('set-order-button').addEventListener('click', function() {
        const classId = document.getElementById('class-id-input').value;
        const week = document.getElementById('week-input').value;
        if(classId && week) setOrder(classId, week);
    });

    document.getElementById('start-review-button').addEventListener('click', function() {
        startReview();
    });

    document.getElementById('show-results-button').addEventListener('click', function() {
        showResults();
    });
});
