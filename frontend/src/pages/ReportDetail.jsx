// import { useState } from "react";
// import { useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { format } from "date-fns";
// import { Download, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
// import api from "../api/axios.js";
// import { Card, ScoreBadge } from "../components/UI.jsx";
// import LoadingSpinner from "../components/LoadingSpinner.jsx";

// export default function ReportDetail() {
//   const { id } = useParams();
//   // const { data, isLoading } = useQuery({
//   //   queryKey: ["report", id],
//   //   queryFn: () => api.get(`/reports/${id}`).then((r) => r.data),
//   // });

//   const { data, isLoading } = useQuery({
//     queryKey: ["report", id],
//     queryFn: () => api.get(`/reports/${id}`).then((r) => r.data),
//   });

//   if (isLoading) return <LoadingSpinner label="Loading report" />;

//   // if (isLoading) return <LoadingSpinner label="Loading report" />;
//   const { report, answers } = data;
//   const [exporting, setExporting] = useState(false);

//   const handleExport = async () => {
//     try {
//       setExporting(true);
//       const response = await api.get(`/reports/${id}/export`, { responseType: 'blob' });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `report-${id}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//     } catch (error) {
//       console.error("Export failed", error);
//       alert("Failed to export PDF");
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
//       <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="font-display text-2xl font-semibold">{report.interview.role}</h1>
//           <p className="text-sm capitalize text-ink/50">
//             {report.interview.interviewType} · {report.interview.difficulty} ·{" "}
//             {format(new Date(report.createdAt), "MMM d, yyyy")}
//           </p>
//         </div>
//         <button
//           onClick={handleExport}
//           disabled={exporting}
//           className="flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
//         >
//           <Download size={16} /> {exporting ? "Exporting..." : "Export PDF"}
//         </button>
//       </div>

//       <Card className="mb-6">
//         <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
//           <ScoreStat label="Overall" value={report.overallScore} highlight />
//           <ScoreStat label="Technical" value={report.technicalScore} />
//           <ScoreStat label="Communication" value={report.communicationScore} />
//           <ScoreStat label="Confidence" value={report.confidenceScore} />
//         </div>
//         {report.summary && <p className="mt-5 border-t border-ink/10 pt-4 text-sm text-ink/70">{report.summary}</p>}
//       </Card>

//       <div className="mb-6 grid gap-4 sm:grid-cols-2">
//         <Card>
//           <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-sage">
//             <TrendingUp size={16} /> Strengths
//           </h2>
//           <ul className="space-y-1 text-sm text-ink/70">
//             {report.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
//           </ul>
//         </Card>
//         <Card>
//           <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-coral">
//             <TrendingDown size={16} /> Weaknesses
//           </h2>
//           <ul className="space-y-1 text-sm text-ink/70">
//             {report.weaknesses?.map((w, i) => <li key={i}>• {w}</li>)}
//           </ul>
//         </Card>
//       </div>

//       <Card className="mb-6">
//         <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-signal">
//           <BookOpen size={16} /> Recommended topics
//         </h2>
//         <div className="flex flex-wrap gap-1.5">
//           {report.recommendedTopics?.map((t) => (
//             <span key={t} className="rounded-full bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal">
//               {t}
//             </span>
//           ))}
//         </div>
//       </Card>

//       <h2 className="mb-3 font-display text-lg font-semibold">Question-by-question breakdown</h2>
//       <div className="space-y-3">
//         {answers.map((a, i) => (
//           <Card key={a._id}>
//             <div className="mb-2 flex items-start justify-between gap-3">
//               <p className="font-medium">{i + 1}. {a.question.text}</p>
//               <ScoreBadge score={a.evaluation.overallScore} max={10} />
//             </div>
//             <p className="mb-2 text-sm text-ink/60">
//               <span className="font-medium text-ink/80">Your answer: </span>
//               {a.userText}
//             </p>
//             <p className="text-sm text-ink/70">{a.evaluation.feedback}</p>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// function ScoreStat({ label, value, highlight }) {
//   return (
//     <div>
//       <p className={`font-mono text-2xl font-semibold ${highlight ? "text-signal" : "text-ink"}`}>{value}</p>
//       <p className="text-xs text-ink/50">{label} / 100</p>
//     </div>
//   );
// }

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Download,
  TrendingUp,
  TrendingDown,
  BookOpen,
} from "lucide-react";
import api from "../api/axios.js";
import { Card, ScoreBadge } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function ReportDetail() {
  const { id } = useParams();

  // ✅ All hooks must be called before any return
  const [exporting, setExporting] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => api.get(`/reports/${id}`).then((r) => r.data),
  });

  if (isLoading) {
    return <LoadingSpinner label="Loading report" />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center text-red-500">
        Failed to load report.
        <br />
        {error?.message}
      </div>
    );
  }

  const { report, answers } = data;

  const handleExport = async () => {
    try {
      setExporting(true);

      const response = await api.get(`/reports/${id}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {report.interview.role}
          </h1>

          <p className="text-sm capitalize text-ink/50">
            {report.interview.interviewType} ·{" "}
            {report.interview.difficulty} ·{" "}
            {format(new Date(report.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
        >
          <Download size={16} />
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ScoreStat
            label="Overall"
            value={report.overallScore}
            highlight
          />
          <ScoreStat
            label="Technical"
            value={report.technicalScore}
          />
          <ScoreStat
            label="Communication"
            value={report.communicationScore}
          />
          <ScoreStat
            label="Confidence"
            value={report.confidenceScore}
          />
        </div>

        {report.summary && (
          <p className="mt-5 border-t border-ink/10 pt-4 text-sm text-ink/70">
            {report.summary}
          </p>
        )}
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-sage">
            <TrendingUp size={16} />
            Strengths
          </h2>

          <ul className="space-y-1 text-sm text-ink/70">
            {report.strengths?.map((strength, index) => (
              <li key={index}>• {strength}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-coral">
            <TrendingDown size={16} />
            Weaknesses
          </h2>

          <ul className="space-y-1 text-sm text-ink/70">
            {report.weaknesses?.map((weakness, index) => (
              <li key={index}>• {weakness}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-signal">
          <BookOpen size={16} />
          Recommended Topics
        </h2>

        <div className="flex flex-wrap gap-1.5">
          {report.recommendedTopics?.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal"
            >
              {topic}
            </span>
          ))}
        </div>
      </Card>

      <h2 className="mb-3 font-display text-lg font-semibold">
        Question-by-question Breakdown
      </h2>

      <div className="space-y-3">
        {answers.map((answer, index) => (
          <Card key={answer._id}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="font-medium">
                {index + 1}. {answer.question.text}
              </p>

              <ScoreBadge
                score={answer.evaluation.overallScore}
                max={10}
              />
            </div>

            <p className="mb-2 text-sm text-ink/60">
              <span className="font-medium text-ink/80">
                Your answer:
              </span>{" "}
              {answer.userText}
            </p>

            <p className="text-sm text-ink/70">
              {answer.evaluation.feedback}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScoreStat({ label, value, highlight }) {
  return (
    <div>
      <p
        className={`font-mono text-2xl font-semibold ${highlight ? "text-signal" : "text-ink"
          }`}
      >
        {value}
      </p>

      <p className="text-xs text-ink/50">
        {label} / 100
      </p>
    </div>
  );
}