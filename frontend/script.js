let timeout; 
let allPlacements = []; // Store everything globally

// 1. INITIALIZE (Run on load)
async function initializeDashboard() {
    try {
        // Fetch ALL data once to build the filters
        const res = await fetch('/api/placements');
        allPlacements = await res.json();

        // Build the dropdowns dynamically
        populateFilters();

        // Load the stats for whatever the default selected filter is
        loadStats();
    } catch (err) {
        console.error("Failed to fetch initial data", err);
    }
}

// 2. DYNAMIC FILTERS
function populateFilters() {
    const yearSelect = document.getElementById("year");
    const branchSelect = document.getElementById("branch");

    const uniqueYears = [...new Set(allPlacements.map(s => s.year))].sort((a, b) => b - a);
    const uniqueBranches = [...new Set(allPlacements.map(s => s.branch))].sort();

    yearSelect.innerHTML = '';
    uniqueYears.forEach(year => {
        if(year) yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    branchSelect.innerHTML = '';
    uniqueBranches.forEach(branch => {
        if(branch) branchSelect.innerHTML += `<option value="${branch}">${branch}</option>`;
    });
}

// 3. LOAD STATS & TABLE
function loadStats() {
    const year = document.getElementById("year").value;
    const branch = document.getElementById("branch").value;

    document.getElementById("heading").innerText = `${branch} Placement Statistics ${year}`;

    // Fetch the calculated stats from your backend
    fetch(`/api/placements/stats?branch=${branch}&year=${year}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalStudents").innerText = data.totalStudents || "N/A";
            document.getElementById("placedStudents").innerText = data.placedStudents;
            document.getElementById("highestPackage").innerText = data.highestPackage ? data.highestPackage + " LPA" : "0 LPA";
            document.getElementById("avgPackage").innerText = data.avgPackage ? data.avgPackage + " LPA" : "0 LPA";

            // Populate the specific students table below the stats
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
                        <td>${student.package}</td>
                    </tr>`;
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No students placed yet for this selection.</td></tr>`;
            }
        });
}

// 4. SEARCH BAR LOGIC
async function searchPlacements() {
    const query = document.getElementById("searchInput").value.toLowerCase();

    // If search is cleared, reload the filtered stats view
    if (query.trim() === "") {
        document.getElementById("heading").innerText = "Placement Statistics";
        loadStats();
        return;
    }

    // Change heading to show we are searching
    document.getElementById("heading").innerText = `Search Results for "${query}"`;

    const res = await fetch(`/api/placements/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    const tableBody = document.getElementById("studentsBody");
    tableBody.innerHTML = "";

    // Clear the stats boxes since we are looking at specific search results
    document.getElementById("totalStudents").innerText = "-";
    document.getElementById("placedStudents").innerText = data.length;
    document.getElementById("highestPackage").innerText = "-";
    document.getElementById("avgPackage").innerText = "-";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No results found</td></tr>`;
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
        </tr>`;
    });
}

function handleSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => { searchPlacements(); }, 300);
}

// EVENT LISTENERS
document.getElementById("filterBtn").addEventListener("click", loadStats);
window.onload = initializeDashboard;