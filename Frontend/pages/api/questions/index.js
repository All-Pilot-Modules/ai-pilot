
import { getDb } from "@/lib/db";
export default async function handler(req, res) {
  const { module, q_no } = req.query;

  if (!module) {
    return res.status(400).json({ error: "Module name is required (e.g. IEP_LAURA)" });
  }

  if (req.method === "GET") {
    try {
      const db = await getDb(module); // dynamically pick correct database

      if (q_no) {
        const { rows } = await db.query("SELECT * FROM questions WHERE question_id = $1", [q_no]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "Question not found" });
        }
        return res.status(200).json(rows[0]);
      } else {
        const { rows } = await db.query("SELECT * FROM questions");
        return res.status(200).json(rows);
      }
    } catch (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } 
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}