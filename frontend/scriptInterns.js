let timeout; 
let allInterns = []; 

async function initializeDashboard() {
    try {
        const res = await fetch('/api/interns');
        allInterns = await res.json();
        populateFilters();
        loadStats();
    } catch (err) {
        console.error("Failed to fetch initial data", err);
    }
}

function populateFilters() {
    const yearSelect = document.getElementById("year");
    const branchSelect = document.getElementById("branch");

    const uniqueYears = [...new Set(allInterns.map(s => s.year))].sort((a, b) => b - a);
    const uniqueBranches = [...new Set(allInterns.map(s => s.branch))].sort();

    yearSelect.innerHTML = '';
    uniqueYears.forEach(year => {
        if(year) yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    branchSelect.innerHTML = '';
    uniqueBranches.forEach(branch => {
        if(branch) branchSelect.innerHTML += `<option value="${branch}">${branch}</option>`;
    });
}

function loadStats() {
    const year = document.getElementById("year").value;
    const branch = document.getElementById("branch").value;

    document.getElementById("heading").innerText = `${branch} Internship Statistics ${year}`;

    fetch(`/api/interns/statsIntern?branch=${branch}&year=${year}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalStudents").innerText = data.totalStudents || "N/A";
            document.getElementById("placedStudents").innerText = data.placedStudents;
            document.getElementById("highestStipend").innerText = data.highestStipend ? data.highestStipend : "0";
            document.getElementById("avgStipend").innerText = data.avgStipend ? data.avgStipend : "0";

            const tableBody = document.getElementById("studentsBody");
            tableBody.innerHTML = "";

            if (data.students && data.students.length > 0) {
                data.students.forEach(student => {
                    tableBody.innerHTML += `
                    <tr>
                        <td>${student.sid}</td>
                        <td>${student.name}</td>
                        <td>${student.company}</td>
                        <td>${student.city}</td>
                        <td>${student.duration}</td>
                        <td>${student.stipend}</td>
                    </tr>`;
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No interns placed yet for this selection.</td></tr>`;
            }
        });
}

async function searchPlacements() {
    const query = document.getElementById("searchInput").value.toLowerCase();

    if (query.trim() === "") {
        loadStats();
        return;
    }

    document.getElementById("heading").innerText = `Search Results for "${query}"`;

    const res = await fetch(`/api/interns/searchIntern?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    const tableBody = document.getElementById("studentsBody");
    tableBody.innerHTML = "";

    document.getElementById("totalStudents").innerText = "-";
    document.getElementById("placedStudents").innerText = data.length;
    document.getElementById("highestStipend").innerText = "-";
    document.getElementById("avgStipend").innerText = "-";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No results found</td></tr>`;
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
        </tr>`;
    });
}

function handleSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => { searchPlacements(); }, 300);
}

document.getElementById("filterBtn").addEventListener("click", loadStats);
window.onload = initializeDashboard;