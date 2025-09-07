import { getDb } from '@/lib/db';
import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { module } = req.query;
  if (!module) {
    return res.status(400).json({ error: 'Module name is required (e.g., ?module=IEP_LAURA)' });
  }

  const db =await getDb(module);

  try {
    const { rows } = await db.query(`
      SELECT
        s.banner_id,
        sa.question_id,
        sa.answer,
        sa.attempt,
        f.feedback
      FROM student_answers sa
      JOIN students s ON sa.student_id = s.id
      LEFT JOIN ai_feedback f 
        ON f.student_id = sa.student_id AND f.question_id = sa.question_id
      ORDER BY s.banner_id, sa.question_id, sa.attempt
    `);

    const grouped = new Map();
    for (const row of rows) {
      const key = `${row.banner_id}_${row.question_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          banner_id: row.banner_id,
          question_id: row.question_id,
          attempt_1_answer: '',
          ai_feedback: row.feedback || '',
          attempt_2_answer: '',
        });
      }
      const item = grouped.get(key);
      if (row.attempt === 1) item.attempt_1_answer = row.answer;
      if (row.attempt === 2) item.attempt_2_answer = row.answer;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Answers');

    worksheet.columns = [
      { header: 'Banner ID', key: 'banner_id', width: 15 },
      { header: 'Question ID', key: 'question_id', width: 15 },
      { header: 'Attempt 1 Answer', key: 'attempt_1_answer', width: 50 },
      { header: 'AI Feedback', key: 'ai_feedback', width: 70 },
      { header: 'Attempt 2 Answer', key: 'attempt_2_answer', width: 50 },
    ];

    Array.from(grouped.values()).forEach((row) => {
      const newRow = worksheet.addRow(row);
      newRow.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: 'top' };
      });
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.getRow(1).font = { bold: true };
    worksheet.eachRow((row, i) => {
      if (i !== 1) row.height = 60;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${module}_student_data.xlsx"`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}