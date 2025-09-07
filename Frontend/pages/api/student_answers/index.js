import { getDb } from '@/lib/db';
export default async function handler(req, res) {
  const { module, id, student_id } = req.query;

  if (!module) {
    return res.status(400).json({ error: "Module name is required (e.g. ?module=IEP_LAURA)" });
  }

  if (req.method === "GET") {
    try {
      const db = await getDb(module);

      if (id) {
        const { rows } = await db.query("SELECT * FROM student_answers WHERE id = $1", [id]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "Student_answer with this ID not found" });
        }
        return res.status(200).json(rows[0]);
      }

      if (student_id) {
        const { rows } = await db.query("SELECT * FROM student_answers WHERE student_id = $1", [student_id]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "No answers found for this student_id" });
        }
        return res.status(200).json(rows);
      }

      const { rows } = await db.query("SELECT * FROM student_answers");
      return res.status(200).json(rows);

    } catch (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}