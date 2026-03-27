let timeout; // ✅ GLOBAL

// 🔍 SEARCH FUNCTION
async function searchPlacements() {
  const query = document.getElementById("searchInput").value;

  // If empty → load default stats
  if (query.trim() === "") {
    loadStats();
    return;
  }

  const res = await fetch(
    `http://localhost:5000/api/interns/searchIntern?q=${encodeURIComponent(query)}`
  );

  const data = await res.json();

  const tableBody = document.getElementById("studentsBody");
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5">No results found</td></tr>`;
    return;
  }

  data.forEach(student => {
    tableBody.innerHTML += `
      <tr>
        <td>${student.sid}</td>
        <td>${student.name}</td>
        <td>${student.company}</td>
        <td>${student.city}</td>
        <td>${student.duration}</td>
        <td>${student.stipend}</td>
      </tr>
    `;
  });
}

// ⚡ HANDLE TYPING
function handleSearch() {
  

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    searchPlacements();
  }, 300);
}


function loadStats(){

const year = document.getElementById("year").value;
const branch = document.getElementById("branch").value;

document.getElementById("heading").innerText = 
    `${branch} Internship Statistics ${year}`;

fetch(`http://localhost:5000/api/interns/statsIntern?branch=${branch}&year=${year}`)
.then(res => res.json())
.then(data => {

document.getElementById("totalStudents").innerText = data.totalStudents;
document.getElementById("placedStudents").innerText = data.placedStudents;
document.getElementById("highestStipend").innerText = data.highestStipend;
document.getElementById("avgStipend").innerText = data.avgStipend;

const tableBody = document.getElementById("studentsBody");
tableBody.innerHTML = "";

data.students.forEach(student => {
tableBody.innerHTML += `
<tr>
<td>${student.sid}</td>
<td>${student.name}</td>
<td>${student.company}</td>
<td>${student.city}</td>
<td>${student.duration}</td>
<td>${student.stipend}</td>
</tr>
`;
});

});
}

document.getElementById("filterBtn").addEventListener("click", loadStats);
window.onload = loadStats;
