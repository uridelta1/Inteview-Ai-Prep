import PDFDocument from "pdfkit";

/**
 * Streams a generated interview report PDF directly to the HTTP response.
 */
export const streamReportPdf = ({ res, user, interview, report, answers }) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=interview-report-${interview._id}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).fillColor("#4f46e5").text("InterviewAI - Performance Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(11).fillColor("#000").text(`Candidate: ${user.name}`);
  doc.text(`Role: ${interview.role}   |   Type: ${interview.interviewType}   |   Difficulty: ${interview.difficulty}`);
  doc.text(`Date: ${new Date(interview.completedAt || interview.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).fillColor("#4f46e5").text("Scores");
  doc.fontSize(11).fillColor("#000");
  doc.text(`Overall: ${report.overallScore}/100`);
  doc.text(`Technical: ${report.technicalScore}/100`);
  doc.text(`Communication: ${report.communicationScore}/100`);
  doc.text(`Confidence: ${report.confidenceScore}/100`);
  doc.moveDown();

  doc.fontSize(14).fillColor("#4f46e5").text("Summary");
  doc.fontSize(11).fillColor("#000").text(report.summary || "-");
  doc.moveDown();

  doc.fontSize(14).fillColor("#16a34a").text("Strengths");
  doc.fontSize(11).fillColor("#000");
  (report.strengths || []).forEach((s) => doc.text(`• ${s}`));
  doc.moveDown();

  doc.fontSize(14).fillColor("#dc2626").text("Weaknesses");
  doc.fontSize(11).fillColor("#000");
  (report.weaknesses || []).forEach((w) => doc.text(`• ${w}`));
  doc.moveDown();

  doc.fontSize(14).fillColor("#4f46e5").text("Recommended Topics to Improve");
  doc.fontSize(11).fillColor("#000");
  (report.recommendedTopics || []).forEach((t) => doc.text(`• ${t}`));
  doc.moveDown();

  doc.addPage();
  doc.fontSize(16).fillColor("#4f46e5").text("Question-by-Question Breakdown");
  doc.moveDown();
  answers.forEach((a, i) => {
    doc.fontSize(12).fillColor("#000").text(`${i + 1}. ${a.question?.text || ""}`, { continued: false });
    doc.fontSize(10).fillColor("#555").text(`Your answer: ${a.userText}`);
    if (a.evaluation) {
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(
          `Score: ${a.evaluation.overallScore}/10  |  Feedback: ${a.evaluation.feedback || ""}`
        );
    }
    doc.moveDown();
  });

  doc.end();
};
