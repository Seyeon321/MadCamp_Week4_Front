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
        const innerbox = document.querySelector('.innerbox');
        innerbox.innerHTML = 
        `
        <div class="lines_open_review"></div>
        <ul class="review-container">
            <!-- 여기에 팀별 리뷰 내용이 표시됩니다 -->
              <li class="criteria-item 1row">
                <criteria_title>기술적 완성도</criteria_title>
                <criteria_content> 오류 없이 안정적으로 돌아가나요?</criteria_content>
                <select id="criteria1">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </li>
              <li class="criteria-item 2row">
                <criteria_title>기술적 난이도</criteria_title>
                <criteria_content> 문제 해결을 위해 적절한 기술을 활용했나요?</criteria_content>
                <select id="criteria2">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </li>
              <li class="criteria-item 3row">
                <criteria_title>심미성</criteria_title>
                <criteria_content> 주제에 맞는 디자인인가요?</criteria_content>
                <select id="criteria3">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </li>
              <li class="criteria-item 4row">
                <criteria_title>성실성</criteria_title>
                <criteria_content> 일과 중에 열심히 참여했나요?</criteria_content>
                <select id="criteria4">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </li>
              <li class="criteria-item 5row">
                ${currentTeamIndex > 0 ? '<button id="back-button">Back</button>' : ''}
                <ul>
                  <strong>${team.student_name_list.map(name => `<li>${name}</li>`).join(',')}</strong>
                </ul>
                ${currentTeamIndex < teamList.length - 1 ? '<button id="next-button"> Next</button>' : '<button id="submit-button">Submit</button>'}
              </li>
          </ul>
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
