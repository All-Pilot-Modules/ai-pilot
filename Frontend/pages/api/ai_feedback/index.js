import { getDb } from '@/lib/db';
export default async function handler(req, res) {
  const { module, id, student_id } = req.query;

  if (!module) {
    return res.status(400).json({ error: "Module name is required (e.g. ?module=IEP_LAURA)" });
  }

  const db =await getDb(module);

  if (req.method === "GET") {
    try {
      if (id) {
        // Get single feedback by feedback ID
        const { rows } = await db.query("SELECT * FROM ai_feedback WHERE id=$1", [id]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "Feedback not found for this ID" });
        }
        return res.status(200).json(rows[0]);
      }

      if (student_id) {
        // Get all feedbacks for one student
        const { rows } = await db.query("SELECT * FROM ai_feedback WHERE student_id=$1", [student_id]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "No feedback found for this student" });
        }
        return res.status(200).json(rows);
      }

      // Get all feedback entries
      const { rows } = await db.query("SELECT * FROM ai_feedback");
      return res.status(200).json(rows);
    } catch (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}