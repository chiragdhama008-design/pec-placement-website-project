const express = require("express");
const router = express.Router();

const intern = require("../modelsIntern/Interns");
const internStats = require("../modelsIntern/internStats"); // ✅ NEW

// ================================
// GET all interns
// ================================
router.get("/", async (req, res) => {
  try {
    const interns = await intern.find();
    res.json(interns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// GET interns + stats (MAIN API)
// ================================
router.get("/statsIntern", async (req, res) => {
  const { branch, year } = req.query;

  try {
    // 1️⃣ Get placed students
    const interns = await intern.find({
      branch,
      year: Number(year)
    });

    const placedStudents = interns.length;

    // 2️⃣ Get total students from Stats collection
    const statsData = await internStats.findOne({
      branch,
      year: Number(year)
    });

    const totalStudents = statsData ? statsData.totalStudents : 0;

    // 3️⃣ If no interns
    if (placedStudents === 0) {
      return res.json({
        totalStudents,
        placedStudents: 0,
        highestStipend: 0,
        avgStipend: 0,
        percentage: 0,
        students: []
      });
    }

    // 4️⃣ Highest stipend
    const highestStipend = Math.max(...interns.map(p => p.stipend));

    // 5️⃣ Average stipend
    const avgStipend =
      interns.reduce((sum, p) => sum + p.stipend, 0) / placedStudents;

    // 6️⃣ intern percentage
    const percentage = totalStudents
      ? ((placedStudents / totalStudents) * 100).toFixed(2)
      : 0;

    // 7️⃣ Final response
    res.json({
      totalStudents,
      placedStudents,
      highestStipend,
      avgStipend: avgStipend.toFixed(2),
      percentage,
      students: interns
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ================================
// 🔍 SEARCH interns (LIVE)
// ================================
router.get("/searchIntern", async (req, res) => {
  const query = req.query.q;

  try {
    if (!query) {
      return res.json([]);
    }

    const results = await intern.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { sid: { $regex: query, $options: "i" } },
        { company: { $regex: query, $options: "i" } }
      ]
    });

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ADD internship
// ================================
router.post("/addIntern", async (req, res) => {
  try {
    const newIntern = new intern(req.body);
    await newIntern.save();
    res.json({ message: "intern added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ADD stats (NEW API)
// ================================
router.post("/add-internStats", async (req, res) => {
  try {
    const stats = new internStats(req.body); // ✅ correct model
    await stats.save();
    res.json({ message: "Internship stats added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// GET branch-wise stats (ENHANCED)
// ================================
router.get("/branch-internStats", async (req, res) => {
  try {
    const data = await intern.aggregate([
      {
        $group: {
          _id: { branch: "$branch", year: "$year" },
          placedStudents: { $sum: 1 },
          highestStipend: { $max: "$stipend" },
          avgStipend: { $avg: "$stipend" }
        }
      },
      {
        $lookup: {
          from: "internStats", // collection name in MongoDB
          let: { branch: "$_id.branch", year: "$_id.year" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$branch", "$$branch"] },
                    { $eq: ["$year", "$$year"] }
                  ]
                }
              }
            }
          ],
          as: "statsData"
        }
      },
      {
        $unwind: {
          path: "$statsData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          totalStudents: "$statsData.totalStudents",
          percentage: {
            $cond: [
              { $gt: ["$statsData.totalStudents", 0] },
              {
                $multiply: [
                  { $divide: ["$placedStudents", "$statsData.totalStudents"] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          branch: "$_id.branch",
          year: "$_id.year",
          placedStudents: 1,
          totalStudents: 1,
          percentage: { $round: ["$percentage", 2] },
          highestStipend: 1,
          avgStipend: { $round: ["$avgStipend", 2] },
          _id: 0
        }
      },
      {
        $sort: { year: 1 }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// DELETE internship (Admin)
// ================================
router.delete("/deleteIntern/:sid", async (req, res) => {
  try {
    const deletedIntern = await intern.findOneAndDelete({ sid: req.params.sid });
    if (!deletedIntern) return res.status(404).json({ message: "Intern not found" });
    res.json({ message: "Intern deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// EDIT internship (Admin)
// ================================
router.put("/editIntern/:sid", async (req, res) => {
  try {
    const updatedIntern = await intern.findOneAndUpdate(
      { sid: req.params.sid },
      req.body,
      { new: true }
    );
    if (!updatedIntern) return res.status(404).json({ message: "Intern not found" });
    res.json({ message: "Intern updated successfully", data: updatedIntern });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
