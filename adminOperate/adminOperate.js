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
                        const teamDiv = document.createElement('div');
                        teamDiv.className = 'team';

                        const studentList = document.createElement('ul');
                        team.student_name_list.forEach(student => {
                            const studentItem = document.createElement('li');
                            studentItem.textContent = student;
                            studentList.appendChild(studentItem);
                        });
                        teamDiv.appendChild(studentList);
                        orderListContainer.appendChild(teamDiv);
                    });
                } else orderListContainer.textContent = '순서를 생성해주세요';
            } else console.error('Failed to fetch order');
        } catch (error) {
            console.error('Error fetching order:', error);
        }
    }

    document.getElementById('set-order-button').addEventListener('click', function() {
        const classId = document.getElementById('class-id-input').value;
        const week = document.getElementById('week-input').value;
        if(classId && week) setOrder(classId, week);
    });

    document.getElementById('start-review-button').addEventListener('click', function() {
        startReview();
    });
});
