function loadStats(){

const year = document.getElementById("year").value;
const branch = document.getElementById("branch").value;
document.getElementById("heading").innerText = 
    `${branch} Placement Statistics ${year}`;

fetch(`http://localhost:5000/api/placements/stats?branch=${branch}&year=${year}`)
.then(res => res.json())
.then(data => {

document.getElementById("totalStudents").innerText = data.totalStudents;
document.getElementById("placedStudents").innerText = data.placedStudents;
document.getElementById("highestPackage").innerText = data.highestPackage + " LPA";
document.getElementById("avgPackage").innerText = data.avgPackage + " LPA";

const tableBody = document.getElementById("studentsBody");
tableBody.innerHTML = "";

data.students.forEach(student => {

tableBody.innerHTML += `
<tr>
<td>${student.sid}</td>
<td>${student.name}</td>
<td>${student.company}</td>
<td>${student.city}</td>
<td>${student.package}</td>
</tr>
`;

});

});

}

document.getElementById("filterBtn").addEventListener("click", loadStats);
window.onload = loadStats;
