import { getDb } from '@/lib/db';
export default async function handler(req, res) {
  const { module, id } = req.query;

  if (!module) {
    return res.status(400).json({ error: "Module name is required (e.g. ?module=IEP_LAURA)" });
  }

  const db = await getDb(module);

  try {
    if (req.method === "GET") {
      if (id) {
        // Get one student
        const { rows } = await db.query("SELECT * FROM students WHERE id = $1", [id]);
        if (rows.length === 0) {
          return res.status(404).json({ error: "Student not found" });
        }
        return res.status(200).json(rows[0]);
      } else {
        // Get all students
        const { rows } = await db.query("SELECT * FROM students");
        return res.status(200).json(rows);
      }
    }

    else if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "Student ID is required for deletion" });
      }

      // Step 1: Delete from child tables first
      await db.query("DELETE FROM ai_feedback WHERE student_id = $1", [id]);
      await db.query("DELETE FROM student_answers WHERE student_id = $1", [id]);

      // Step 2: Then delete the student
      const { rowCount } = await db.query("DELETE FROM students WHERE id = $1", [id]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "Student not found" });
      }

      return res.status(200).json({ message: "Student and related data deleted" });
    }

    else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await db.end();
  }
}