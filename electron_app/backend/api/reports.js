const express = require('express');
const router = express.Router();

// POST /api/reports/generate - Generate a dummy report
router.post('/generate', (req, res) => {
  const { patient_id, report_type, date_range_start, date_range_end, template_id } = req.body;

  console.log('Generating report with params:', { patient_id, report_type, date_range_start, date_range_end, template_id });

  // Dummy patient data - in a real app, fetch from DB based on patient_id
  const patientName = patient_id ? `Patient ${patient_id}` : "Generic Patient";
  
  let reportTitle = `${report_type || "General Report"} for ${patientName}`;
  let baseSections = [
      {
        title: "Attendance Summary (Default)",
        type: "table",
        data: {
          headers: ["Date", "Status", "Session Type"],
          rows: [
            ["2023-10-01", "Attended", "Individual Therapy"],
            ["2023-10-08", "Cancelled by Patient", "Individual Therapy"],
            ["2023-10-15", "Attended", "Group Session"],
            ["2023-10-22", "Attended", "Individual Therapy"],
          ],
        },
      },
      {
        title: "Goal Progress: Communication Skills",
        type: "chart_data",
        chart_type: "line", // e.g., 'line', 'bar', 'pie'
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
          datasets: [
            {
              label: "Self-reported Communication Ease (Scale 1-10)",
              data: [3, 4, 5, 7, 8],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: "Observed Use of Coping Strategies (Count)",
              data: [1, 2, 2, 4, 5],
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            }
          ],
        },
      },
      {
        title: "Narrative Summary (Default)",
        type: "text",
        content: `This is the default narrative summary for ${patientName} for the period ${date_range_start || 'start'} to ${date_range_end || 'end'}. It outlines general observations and progress.`,
      },
      {
        title: "Key Metrics (Default)",
        type: "key_value_pairs",
        data: [
            { key: "Total Sessions Attended", value: "30" },
            { key: "Cancellation Rate", value: "10%" },
            { key: "Average Mood Score (Last 5 Sessions)", value: "7.5/10" }
        ]
      }
  ];

  // Modify title and sections based on template_id
  if (template_id === "insurance_summary") {
    reportTitle = `Insurance Summary for ${patientName}`;
    baseSections = [
      {
        title: "Insurance Justification",
        type: "text",
        content: `This report provides a summary for insurance purposes for ${patientName}. Key diagnoses include [Placeholder Diagnosis]. Treatment goals focus on [Placeholder Goals]. Progress is rated as [Placeholder Progress Rating]. This summary is for the period ${date_range_start || 'start'} to ${date_range_end || 'end'}.`,
      },
      {
        title: "Session Count for Insurance",
        type: "key_value_pairs",
        data: [
          { key: "Total Sessions This Period", value: "8" },
          { key: "CPT Code(s) Used", value: "90837, 90791 (dummy)" },
        ]
      }
    ];
  } else if (template_id === "school_communication") {
    reportTitle = `School Communication Note for ${patientName}`;
    baseSections = [
      {
        title: "Student Information",
        type: "key_value_pairs",
        data: [
            { key: "Student Name", value: patientName },
            { key: "Date of Birth", value: "2015-03-10 (dummy)" }, // Fetch real DOB if available
            { key: "School", value: "Anytown Elementary (dummy)" },
        ]
      },
      {
        title: "Recommendations for School Environment",
        type: "text",
        content: `For ${patientName}, the following strategies are recommended in the school setting: 
1. Allow for short breaks during long tasks.
2. Provide clear, concise instructions.
3. Positive reinforcement for on-task behavior.
Please contact us for further discussion. This note covers observations from ${date_range_start || 'start'} to ${date_range_end || 'end'}.`,
      },
      baseSections.find(s => s.title.includes("Attendance Summary")) || { title: "Attendance (School)", type: "text", content: "N/A for this template."} // Include attendance if relevant
    ];
  }


  const reportData = {
    reportTitle: reportTitle,
    patientInfo: {
      name: patientName,
      id: patient_id || "N/A",
    },
    dateGenerated: new Date().toISOString(),
    parametersReceived: { // Echo back parameters for confirmation
        patient_id,
        report_type,
        date_range_start,
        date_range_end,
        template_id // also echo back template_id
    },
    sections: baseSections,
  };

  // Simulate some delay
  setTimeout(() => {
    res.status(200).json(reportData);
  }, 500);
});

module.exports = router;
