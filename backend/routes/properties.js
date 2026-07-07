const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (limit <= 0 || limit > 100) {
      return res.status(400).json({ error: "limit must be between 1 and 100" });
    }
    if (offset < 0) {
      return res.status(400).json({ error: "offset must be 0 or greater" });
    }

    const conditions = [];
    const values = [];

    if (req.query.city) {
      conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      values.push(req.query.city);
    }
    if (req.query.zipcode) {
      conditions.push("L_Zip = ?");
      values.push(req.query.zipcode);
    }
    if (req.query.minPrice) {
      if (isNaN(req.query.minPrice)) {
        return res.status(400).json({ error: "minPrice must be a valid number" });
      }
      conditions.push("L_SystemPrice >= ?");
      values.push(Number(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      if (isNaN(req.query.maxPrice)) {
        return res.status(400).json({ error: "maxPrice must be a valid number" });
      }
      conditions.push("L_SystemPrice <= ?");
      values.push(Number(req.query.maxPrice));
    }
    if (req.query.beds) {
      if (isNaN(req.query.beds)) {
        return res.status(400).json({ error: "beds must be a valid number" });
      }
      conditions.push("L_Keyword2 >= ?");
      values.push(Number(req.query.beds));
    }
    if (req.query.baths) {
      if (isNaN(req.query.baths)) {
        return res.status(400).json({ error: "baths must be a valid number" });
      }
      conditions.push("LM_Dec_3 >= ?");
      values.push(Number(req.query.baths));
    }

    const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const countQuery = `SELECT COUNT(*) as total FROM rets_property ${where}`;
    const [countRows] = await pool.query(countQuery, values);
    const total = countRows[0].total;

    const dataQuery = `SELECT * FROM rets_property ${where} LIMIT ? OFFSET ?`;
    const [results] = await pool.query(dataQuery, [...values, limit, offset]);

    res.json({ total, limit, offset, results });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;