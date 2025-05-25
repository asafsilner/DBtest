import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3001/api';

interface ReportSection {
  title: string;
  type: 'table' | 'chart_data' | 'text' | 'key_value_pairs'; // Added key_value_pairs
  data?: any; // Flexible for different data types
  content?: string; // For text type
  chart_type?: string; // For chart_data type
}

interface ReportData {
  reportTitle: string;
  patientInfo: { name: string; id: string };
  dateGenerated: string;
  sections: ReportSection[];
  parametersReceived?: any; // To display what was sent
}

const ReportPage: React.FC = () => {
  // State for report parameters
  const [patientId, setPatientId] = useState<string>('patient-123'); // Default dummy
  const [reportType, setReportType] = useState<string>('Progress Summary'); // Still useful as a base type
  const [templateId, setTemplateId] = useState<string>('default'); // New state for template ID
  const [dateStart, setDateStart] = useState<string>('2023-01-01');
  const [dateEnd, setDateEnd] = useState<string>(new Date().toISOString().split('T')[0]);

  // State for report display
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          report_type: reportType, // This could be derived from template or still be a separate field
          template_id: templateId, // Send the selected template ID
          date_range_start: dateStart,
          date_range_end: dateEnd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Report generation failed: ${response.statusText}`);
      }
      const data: ReportData = await response.json();
      setReportData(data);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (section: ReportSection, index: number) => {
    return (
      <div key={index} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4 border-b border-indigo-100 pb-2">{section.title}</h3>
        {section.type === 'table' && section.data && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  {section.data.headers.map((header: string, hIndex: number) => (
                    <th key={hIndex} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {section.data.rows.map((row: string[], rIndex: number) => (
                  <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                    {row.map((cell: string, cIndex: number) => (
                      <td key={cIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {section.type === 'chart_data' && section.data && (
          <div style={{ width: '100%', height: 300 }} className="my-4 p-4 bg-gray-50 rounded-lg shadow">
            <ResponsiveContainer>
              {section.chart_type === 'line' && (
                <LineChart data={
                    // Transform backend data structure to what Recharts expects for LineChart
                    // Assuming section.data.labels are x-axis points
                    // And section.data.datasets are different lines
                    section.data.labels.map((label: string, index: number) => {
                        const dataPoint: any = { name: label };
                        section.data.datasets.forEach((dataset: any) => {
                            dataPoint[dataset.label] = dataset.data[index];
                        });
                        return dataPoint;
                    })
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {section.data.datasets.map((dataset: any, dsIndex: number) => (
                    <Line 
                        key={dsIndex} 
                        type="monotone" 
                        dataKey={dataset.label} 
                        stroke={dataset.borderColor || (dsIndex === 0 ? '#8884d8' : '#82ca9d')} // Default colors
                        activeDot={{ r: 8 }} 
                    />
                  ))}
                </LineChart>
              )}
              {section.chart_type === 'bar' && (
                 <BarChart data={
                    section.data.labels.map((label: string, index: number) => {
                        const dataPoint: any = { name: label };
                        section.data.datasets.forEach((dataset: any) => {
                            dataPoint[dataset.label] = dataset.data[index];
                        });
                        return dataPoint;
                    })
                 }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {section.data.datasets.map((dataset: any, dsIndex: number) => (
                        <Bar 
                            key={dsIndex} 
                            dataKey={dataset.label} 
                            fill={dataset.backgroundColor || (dsIndex === 0 ? '#8884d8' : '#82ca9d')} // Default colors
                        />
                    ))}
                 </BarChart>
              )}
              {/* Add other chart types like 'pie' if needed */}
              {!['line', 'bar'].includes(section.chart_type || '') && (
                <p className="text-gray-700 text-center pt-10">
                  Chart type "<strong className="font-medium">{section.chart_type}</strong>" is not yet supported in this view.
                  Data available for: <em className="text-indigo-600">{section.data.datasets.map((ds: any) => ds.label).join(', ')}</em>.
                </p>
              )}
            </ResponsiveContainer>
          </div>
        )}
        {section.type === 'text' && section.content && (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{section.content}</p>
        )}
        {section.type === 'key_value_pairs' && section.data && Array.isArray(section.data) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {section.data.map((item: {key: string, value: string}, kvIndex: number) => (
                    <div key={kvIndex} className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">{item.key}:</span>
                        <span className="text-sm text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Report Generation</h1>
        <p className="text-lg text-gray-600 mt-2">
          Create and view detailed reports for patients and system activity.
        </p>
      </header>

      {/* Report Parameters Section */}
      <form onSubmit={handleGenerateReport} className="p-8 bg-white rounded-xl shadow-xl border border-gray-200 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Configure Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end"> {/* items-end for button alignment */}
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">Patient ID:</label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., patient-123"
            />
          </div>
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Report Type:</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option>Progress Summary</option>
              <option>Attendance Report</option>
              <option>Billing Overview</option>
              <option>Full Assessment</option>
            </select>
          </div>
          <div>
            <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">Report Template:</label>
            <select
              id="templateId"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="default">Default Progress Report</option>
              <option value="insurance_summary">Insurance Summary</option>
              <option value="school_communication">School Communication Note</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700 mb-1">Date Range (Start):</label>
            <input
              type="date"
              id="dateStart"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700 mb-1">Date Range (End):</label>
            <input
              type="date"
              id="dateEnd"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors
                        ${isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        }
                        focus:outline-none`}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>

      {/* Report Display Section */}
      {isLoading && <div className="text-center p-6"><p className="text-lg text-indigo-600 animate-pulse">Loading report...</p></div>}
      {error && <div className="mt-6 p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-md" role="alert">Error: {error}</div>}
      
      {reportData && (
        <div className="mt-10 p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">{reportData.reportTitle}</h2>
            <p className="text-sm text-gray-500">Patient: {reportData.patientInfo.name} (ID: {reportData.patientInfo.id})</p>
            <p className="text-sm text-gray-500">Generated on: {new Date(reportData.dateGenerated).toLocaleString()}</p>
          </header>

          {/* Export Buttons */}
          <div className="mb-8 flex justify-center space-x-4 py-4 border-b border-t border-gray-200">
            <button
              onClick={() => {
                console.log("Export to PDF button clicked - functionality not implemented yet.");
                alert("Export to PDF functionality is not yet implemented.");
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Export to PDF
            </button>
            <button
              onClick={() => {
                console.log("Export to CSV button clicked - functionality not implemented yet.");
                alert("Export to CSV functionality is not yet implemented.");
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              Export to CSV
            </button>
          </div>
          
          {reportData.sections.map(renderSection)}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
