import ngrokUrl from "../ngrokUrl.js";

document.addEventListener('DOMContentLoaded', async function() {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('token'));

    if (!cookieValue) {
        console.error('No access token found in cookies');
        return;
    }

    const token = cookieValue.split('=')[1];
    console.log('token sent:', token);
//==============================token sent==============================
//==============================분반 리스트 보여주기 - GET==============================
    let selectedClassId = null;

    async function loadClasses() {
        try {
            const response = await fetch(`${ngrokUrl.url}/admin/setting/classes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Classes received from server:', responseData);  // Debugging log

                const classes = responseData.class_id_list;  // Assuming the JSON has a "classes" key with an array
                const classList = document.querySelector('.class-list');
                classList.innerHTML = '';
                classes.forEach(classItem => {
                    const classDiv = document.createElement('div');
                    classDiv.className = 'class-item';
                    classDiv.textContent = `${classItem}분반`;
                    classDiv.addEventListener('click', () => {
                        if (classDiv.classList.contains('selected')) {
                            classDiv.classList.remove('selected');
                            selectedClassId = null;
                            document.querySelector('.class-info').textContent = '분반 정보';
                        } else {
                            document.querySelectorAll('.class-item').forEach(item => item.classList.remove('selected'));
                            classDiv.classList.add('selected');
                            selectedClassId = classItem;
                            document.querySelector('.class-info').textContent = `${classItem}분반 정보`;
                        } console.log('selected class id:', selectedClassId);
                    });
                    classList.appendChild(classDiv);
                });
            } else {
                console.error('Failed to fetch class list');
            }
        } catch (error) {
            console.error('Error fetching class list:', error);
        }
    }
    await loadClasses();

//==============================분반 추가 - POST==============================
    const plusButton = document.querySelector('.create-new-class1');
    const selectedClassId_mod =  selectedClassId;
    if (plusButton) {
        plusButton.addEventListener('click', async () => {
            console.log('Plus button clicked');  // Debugging log
            try {
                const response = await fetch(`${ngrokUrl.url}/admin/setting/addclass`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const addClass = await response.json();
                    const classList = document.querySelector('.class-list');
                    const classItem = document.createElement('div');
                    classItem.className = 'class-item';
                    classItem.textContent = `${addClass.new_class_id}분반`;
                    classItem.addEventListener('click', () => {
                        if (classItem.classList.contains('selected')) {
                            classItem.classList.remove('selected');
                            selectedClassId_mod = null;
                            document.querySelector('.class-info').textContent = '분반 정보';
                        } else {
                            document.querySelectorAll('.class-item').forEach(item => item.classList.remove('selected'));
                            classItem.classList.add('selected');
                            selectedClassId_mod = addClass.new_class_id;
                            document.querySelector('.class-info').textContent = `${addClass.new_class_id}분반 정보`;
                        } console.log('selected:', selectedClassId);
                    });
                    classList.appendChild(classItem);
                } else {
                    console.error('Failed to fetch class info');
                }
            } catch (error) {
                console.error('Error fetching class info:', error);
            }
        });
    } else {
        console.error('Plus button not found');
    }
//==============================학생 리스트 보여주기 - POST==============================
    document.getElementById('load-students-button').addEventListener('click', async () => {
        if (!selectedClassId) {
            console.error('Please select a class first');
            return;
        }

        await loadStudents(selectedClassId, token);
    });

    async function loadStudents(classId, token) {
        console.log("selected class:", classId);
        try {
            const response = await fetch(`${ngrokUrl.url}/admin/setting/studentlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({class_id: classId})
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Students received from server:', responseData);  // Debugging log
    
                const students = responseData.student_list;  // Assuming the JSON has a "studentlist" key with an array
                const stuList = document.querySelector('.student-list');
                stuList.innerHTML = '';  // Clear any existing student list
                students.forEach(stuItem => {

                    console.log('Student Item:', stuItem);

                    const stuDiv = document.createElement('div');
                    stuDiv.className = 'student-item';
                    stuDiv.textContent = `${stuItem.name}`;  // Assuming each student item has a "name" property

                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'action-button delete-button';
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', async () => {
                        console.log('Student ID to be deleted:', stuItem.student_id);
                        await deleteStudent(stuItem.student_id, token, stuDiv);
                    });
                    stuList.appendChild(stuDiv);
                    stuDiv.appendChild(deleteButton);
                });
            } else {
                console.error('Failed to fetch student list');
            }
        } catch (error) {
            console.error('Error fetching student list:', error);
        }
    }
//==============================학생 추가 - POST==============================
    async function addStudent(studentName, classId, token) {
        try {
            const response = await fetch(`${ngrokUrl.url}/admin/setting/addstudent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_name: studentName, class_id: classId })
            });

            if (response.ok) {
                console.log(`Student ${studentName} added to class ${selectedClassId}`);
                await loadStudents(classId, token); // reload after adding
            } else {
                console.error('Failed to add student');
            }
        } catch (error) {
            console.error('Error adding student:', error);
        }
    }
//==============================학생 삭제 - PUT==============================
    async function deleteStudent(studentId, token, studentElement){
        try {

            console.log('Deleting student with ID:', studentId);

            const response = await fetch(`${ngrokUrl.url}/admin/setting/dropstudent`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentId})
            });

            if (response.ok) {
                studentElement.remove();
                console.log(`Student with ID ${studentId} deleted`);
            } else {
                let errorMessage;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                   errorMessage = await response.text();
                }
                console.error('Failed to delete student:', errorMessage);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }

    document.getElementById('add-students-button').addEventListener('click', async (event) => {
        const studentNameInput = document.querySelector('.student-input');
        const studentName = studentNameInput.value;
        if (!studentName || !selectedClassId) {
            console.error('Student name or class not selected');
            return;
        }

        await addStudent(studentName, selectedClassId, token);
        studentNameInput.value = '';
    });
});
