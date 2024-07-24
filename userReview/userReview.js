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
    let teamList = [];
    let currentTeamIndex = 0;
    let reviewList = [];
//==============================token sent==============================

//==============================review 열렸는지 확인: GET==============================
    async function isOpen() {
        try {
            const response = await fetch(`${ngrokUrl.url}/review`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                console.log('response:', data);
                
                if(data.review_is_open) {
                    currentClassId = data.class_id;
                    currentWeek = data.week;

                    getTeamList();
                }
                else console.log('Review is not open');
            } else{
                const errorData = await response.json();
                console.error('Failed to check if review is open:', errorData);
            }
        } catch (error) {
            console.error('Error checking if review is open', error);
        }
    }
//==============================order 받아오기: POST==============================
    async function getTeamList() {
        try {
            const response = await fetch(`${ngrokUrl.url}/teamlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({class_id: currentClassId, week: currentWeek})
            });

            if(response.ok) {
                const data = await response.json();
                teamList = data.team_list;
                if(teamList.length > 0) displayTeam();
            }
            else console.error('Failed to fetch team list');
        } catch(error){
            console.error('Error fetching team list', error);
        }
    }   
//==============================review 하기: POST==============================
    async function submitReview() {
        try {
            const response = await fetch(`${ngrokUrl.url}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({review_list: reviewList})
            });
            if (response.ok) console.log('Review submitted succesfully');
            else console.error('Failed to submit review');
        } catch (error) {
            console.error('Error submitting review', error);
        }
    }
//==============================팀별 리뷰 화면 보여주기==============================
    function displayTeam() {
        const team = teamList[currentTeamIndex];
        const reviewContainer = document.querySelector('.review-container');
        reviewContainer.innerHTML = `
            <h2>Team ${currentTeamIndex + 1}</h2>
            <ul>
                ${team.student_name_list.map(name => `<li>${name}</li>`).join('')}
            </ul>
            <div>
                <label>Criteria 1: 
                    <select id="criteria1">
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                    </select>
                </label>
                <label>Criteria 2: 
                    <select id="criteria2">
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                    </select>
                </label>
                <label>Criteria 3: 
                    <select id="criteria3">
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                    </select>
                </label>
                <label>Criteria 4: 
                    <select id="criteria4">
                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                    </select>
                </label>
            </div>
        `;

        const buttonContainer = document.querySelector('.button-container');
        buttonContainer.innerHTML = `
            ${currentTeamIndex > 0 ? '<button id="back-button">Back</button>' : ''}
            ${currentTeamIndex < teamList.length - 1 ? '<button id="next-button">Next</button>' : '<button id="submit-button">Submit</button>'}
        `;

        if(currentTeamIndex > 0) {
            document.getElementById('back-button').addEventListener('click', () => {
                saveCurrentReview();
                currentTeamIndex --;
                displayTeam();
            });
        }

        if(currentTeamIndex < teamList.length - 1) {
            document.getElementById('next-button').addEventListener('click', () => {
                saveCurrentReview();
                currentTeamIndex ++;
                displayTeam();
            });
        } else{
            document.getElementById('submit-button').addEventListener('click', () => {
                saveCurrentReview();
                submitReview();
            });
        }
    }

    function saveCurrentReview() {
        const team = teamList[currentTeamIndex];
        const criteria1 = document.getElementById('criteria1').value;
        const criteria2 = document.getElementById('criteria2').value;
        const criteria3 = document.getElementById('criteria3').value;
        const criteria4 = document.getElementById('criteria4').value;

        const review = {
            team_id: team.team_id,
            criteria1: parseInt(criteria1),
            criteria2: parseInt(criteria2),
            criteria3: parseInt(criteria3),
            criteria4: parseInt(criteria4)
        };

        reviewList[currentTeamIndex] = review;
    }

    isOpen();
});
