import { getDb } from '@/lib/db';

export default async function handler(req, res) {
  const { module, id } = req.query;

  if (!module) {
    return res.status(400).json({ error: "Module name is required (e.g. ?module=IEP_LAURA)" });
  }

  const db =await getDb(module);

  // ✅ GET handler
  if (req.method === "GET") {
    try {
      if (id) {
        const { rows } = await db.query("SELECT * FROM student_answers WHERE id = $1", [id]);

        if (rows.length === 0) {
          return res.status(404).json({ error: "Student_answer of this id is not found" });
        }

        return res.status(200).json(rows[0]);
      } else {
        const { rows } = await db.query("SELECT * FROM student_answers");
        return res.status(200).json(rows);
      }
    } catch (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ DELETE handler
  else if (req.method === "DELETE") {
    try {
      const { rowCount } = await db.query("DELETE FROM student_answers WHERE id = $1", [id]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "Student_answer not found or already deleted" });
      }

      return res.status(200).json({ message: "Student_answer deleted successfully" });
    } catch (err) {
      console.error("DB delete error:", err);
      return res.status(500).json({ error: "Failed to delete student answer" });
    }
  }

  // ❌ Unsupported method
  else {
    res.setHeader("Allow", ["GET", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}