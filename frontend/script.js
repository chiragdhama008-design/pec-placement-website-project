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
    `http://localhost:5000/api/placements/search?q=${encodeURIComponent(query)}`
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
        <td>${student.package}</td>
      </tr>
    `;
  });
}

// ⚡ HANDLE TYPING (THIS WAS MISSING ❌)
function handleSearch() {
  

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    searchPlacements();
  }, 300);
}

// ================================
// EXISTING CODE (UNCHANGED)
// ================================
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
