import ngrokUrl from "../ngrokUrl.js";

document.addEventListener('DOMContentLoaded', async function() {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('token'));

    if (!cookieValue) {
        console.error('No access token found in cookies');
        return;
    }

    const token = cookieValue.split('=')[1];
    console.log('token sent:', token);

    let selectedClassId = null;

    // Function to load existing classes
    async function loadClasses() {
        try {
            const response = await fetch(`${ngrokUrl.url}/admin/setting/classes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': '69420'
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Classes received from server:', responseData);  // Debugging log

                const classes = responseData.class_id_list;  // Assuming the JSON has a "classes" key with an array
                const classList = document.querySelector('.class-list');
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
                        }
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

    // Load existing classes on page load
    await loadClasses();

    // Add event listener for the plus button
    const plusButton = document.querySelector('.create-new-class1');
    if (plusButton) {
        plusButton.addEventListener('click', async () => {
            console.log('Plus button clicked');  // Debugging log
            try {
                const response = await fetch(`${ngrokUrl.url}/admin/setting/addclass`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': '69420'
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
                            selectedClassId = null;
                            document.querySelector('.class-info').textContent = '분반 정보';
                        } else {
                            document.querySelectorAll('.class-item').forEach(item => item.classList.remove('selected'));
                            classItem.classList.add('selected');
                            selectedClassId = addClass.new_class_id;
                            document.querySelector('.class-info').textContent = `${addClass.new_class_id}분반 정보`;
                        }
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
        console.error('Plus button not found');  // Debugging log
    }

    document.querySelector('.class-stu-list').addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-button')) {
            const studentNameInput = event.target.previousElementSibling;
            const studentName = studentNameInput.value;
            if (!studentName || !selectedClassId) {
                console.error('Student name or class not selected');
                return;
            }

            try {
                const response = await fetch(`${ngrokUrl.url}/admin/setting/addstudent`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    body: JSON.stringify({ student_name: studentName, class_id: selectedClassId })
                });

                if (response.ok) {
                    studentNameInput.value = ''; // clear input after successful addition
                    console.log(`Student ${studentName} added to class ${selectedClassId}`);
                } else {
                    console.error('Failed to add student');
                }
            } catch (error) {
                console.error('Error adding student:', error);
            }
        } else if (event.target.classList.contains('delete-button')) {
            const studentName = event.target.previousElementSibling.textContent;

            try {
                const response = await fetch(`${ngrokUrl.url}/admin/setting/deletestudent`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    body: JSON.stringify({ student_name: studentName })
                });

                if (response.ok) {
                    event.target.parentElement.remove(); // remove element from DOM
                    console.log(`Student ${studentName} deleted`);
                } else {
                    console.error('Failed to delete student');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    });
});
