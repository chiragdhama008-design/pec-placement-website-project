async function loadChart() {
  try {
    const res = await fetch("http://localhost:5000/api/placements/branch-stats");
    const result = await res.json();

    console.log("DATA:", result);

    if (!result.length) {
      alert("No data received from backend");
      return;
    }

    // ✅ NEW FORMAT
    const years = [...new Set(result.map(item => item.year))];
    const branches = [...new Set(result.map(item => item.branch))];

    const datasets = branches.map(branch => ({
      label: branch,
      data: years.map(year => {
        const match = result.find(
          item => item.branch === branch && item.year === year
        );
        return match ? match.placedStudents : 0; // ✅ use placedStudents
      }),
      borderWidth: 1
    }));

    const ctx = document.getElementById("myChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true
      }
    });

  } catch (err) {
    console.error("ERROR:", err);
    alert("Something went wrong. Check console.");
  }
}

loadChart();