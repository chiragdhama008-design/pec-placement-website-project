const express = require("express");
const router = express.Router();

const Placement = require("../models/Placement");
const Stats = require("../models/Stats"); // ✅ NEW

// ================================
// GET all placements
// ================================
router.get("/", async (req, res) => {
  try {
    const placements = await Placement.find();
    res.json(placements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// GET placements + stats (MAIN API)
// ================================
router.get("/stats", async (req, res) => {
  const { branch, year } = req.query;

  try {
    // 1️⃣ Get placed students
    const placements = await Placement.find({
      branch,
      year: Number(year)
    });

    const placedStudents = placements.length;

    // 2️⃣ Get total students from Stats collection
    const statsData = await Stats.findOne({
      branch,
      year: Number(year)
    });

    const totalStudents = statsData ? statsData.totalStudents : 0;

    // 3️⃣ If no placements
    if (placedStudents === 0) {
      return res.json({
        totalStudents,
        placedStudents: 0,
        highestPackage: 0,
        avgPackage: 0,
        percentage: 0,
        students: []
      });
    }

    // 4️⃣ Highest package
    const highestPackage = Math.max(...placements.map(p => p.package));

    // 5️⃣ Average package
    const avgPackage =
      placements.reduce((sum, p) => sum + p.package, 0) / placedStudents;

    // 6️⃣ Placement percentage
    const percentage = totalStudents
      ? ((placedStudents / totalStudents) * 100).toFixed(2)
      : 0;

    // 7️⃣ Final response
    res.json({
      totalStudents,
      placedStudents,
      highestPackage,
      avgPackage: avgPackage.toFixed(2),
      percentage,
      students: placements
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ================================
// 🔍 SEARCH placements (LIVE)
// ================================
router.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    if (!query) {
      return res.json([]);
    }

    const results = await Placement.find({
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
// ADD placement
// ================================
router.post("/add", async (req, res) => {
  try {
    const placement = new Placement(req.body);
    await placement.save();
    res.json({ message: "Placement added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ADD stats (NEW API)
// ================================
router.post("/add-stats", async (req, res) => {
  try {
    const stats = new Stats(req.body);
    await stats.save();
    res.json({ message: "Stats added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// GET branch-wise stats (ENHANCED)
// ================================
router.get("/branch-stats", async (req, res) => {
  try {
    const data = await Placement.aggregate([
      {
        $group: {
          _id: { branch: "$branch", year: "$year" },
          placedStudents: { $sum: 1 },
          highestPackage: { $max: "$package" },
          avgPackage: { $avg: "$package" }
        }
      },
      {
        $lookup: {
          from: "stats", // collection name in MongoDB
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
          highestPackage: 1,
          avgPackage: { $round: ["$avgPackage", 2] },
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


module.exports = router;
