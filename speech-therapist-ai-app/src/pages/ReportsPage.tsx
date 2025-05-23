import React, { useState, useEffect, useRef } from 'react';
import styles from './ReportsPage.module.css';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet as PDFStyles, Image, Font } from '@react-pdf/renderer'; // Added Font
import { mockPatientProgressData, mockPerformanceCategories, mockStrengths, mockChallenges, mockReportPatient } from '../services/mockReportData';
import { Patient } from '../types/patient.types';
import { getPatients } from '../services/patientService';
// import { FaFilePdf, FaFileWord, FaFileCsv, FaChartLine } from 'react-icons/fa'; // Example Icons

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler );

// Font registration for PDF (ensure font files are in public/fonts or accessible path)
try {
    Font.register({
      family: 'Assistant', // Match the primary font
      fonts: [
        { src: '/fonts/Assistant-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Assistant-SemiBold.ttf', fontWeight: 600 }, // Using SemiBold for PDF bold
        { src: '/fonts/Assistant-Bold.ttf', fontWeight: 'bold' },
      ]
    });
  } catch (e) {
    console.warn("Could not register Assistant font for PDF. PDF text might not render correctly.", e);
  }

const pdfStyles = PDFStyles.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30, fontFamily: 'Assistant', direction: 'rtl' },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center', color: '#059669', fontWeight: 600 },
  patientInfo: { fontSize: 12, marginBottom: 5, textAlign: 'right', color: '#374151' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 10, color: '#2563EB', borderBottomWidth: 1, borderBottomColor: '#DBEAFE', paddingBottom: 4, textAlign: 'right' },
  text: { fontSize: 10, marginBottom: 5, textAlign: 'right', lineHeight: 1.6, color: '#4B5563' },
  listItem: { fontSize: 10, marginBottom: 4, marginLeft: 15, textAlign: 'right', lineHeight: 1.5 }, // marginLeft for RTL bullet simulation
  chartPlaceholder: { fontSize: 10, fontStyle: 'italic', color: '#6B7280', textAlign: 'center', marginVertical: 20, padding: 10, borderWidth:1, borderColor: '#E5E7EB', borderRadius: 4 },
  chartImage: { width: 500, height: 250, alignSelf: 'center', marginVertical: 15, border: '1px solid #eee' }, // Added border for charts
  section: { marginBottom: 15 },
});

const ReportsPage: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(mockReportPatient as Patient);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reportPeriod, setReportPeriod] = useState({ from: '2024-01-01', to: new Date().toISOString().split('T')[0] });
  const [focusAreas, setFocusAreas] = useState<string[]>(mockPatientProgressData.slice(0,2).map(g => g.goalName)); // Default to first two goals
  const [reportTemplate, setReportTemplate] = useState<string>('דוח להורים');
  const [pdfLoadingMessage, setPdfLoadingMessage] = useState('');
  const [chartImages, setChartImages] = useState<{ lineChart?: string; barChart?: string }>({});

  const lineChartRef = useRef<ChartJS<'line', number[], string>>(null);
  const barChartRef = useRef<ChartJS<'bar', number[], string>>(null);

  useEffect(() => {
    const fetchPatientsList = async () => {
        try {
            const fetchedPatients = await getPatients();
            const uniquePatients = [mockReportPatient as Patient, ...fetchedPatients.filter(p => p.id !== mockReportPatient.id)];
            setPatients(uniquePatients);
            if (!selectedPatient && uniquePatients.length > 0) {
              // setSelectedPatient(uniquePatients[0]); // Option: auto-select first
            }
        } catch (error) { console.error("Error fetching patients list:", error); }
    };
    fetchPatientsList();
  }, []); // Removed selectedPatient from deps to avoid loop if auto-selecting

  useEffect(() => {
    const generateChartImages = async () => {
        if (!selectedPatient) { // Don't generate if no patient selected
            setChartImages({});
            setPdfLoadingMessage(''); // Clear any loading message
            return;
        }
        setPdfLoadingMessage('מעבד תרשימים...');
        await new Promise(resolve => setTimeout(resolve, 600)); // Ensure charts are rendered
        try {
            const lineChartImage = lineChartRef.current?.toBase64Image();
            const barChartImage = barChartRef.current?.toBase64Image();
            setChartImages({ lineChart: lineChartImage, barChart: barChartImage });
            setPdfLoadingMessage(''); // Clear message on success
        } catch (e) {
            console.error("Error generating chart images:", e);
            setChartImages({}); // Clear images on error
            setPdfLoadingMessage('שגיאה בעיבוד תרשימים.');
        }
    };
    generateChartImages();
  }, [selectedPatient]);


  const goalProgressChartData = {
    labels: mockPatientProgressData[0]?.data.map(d => d.week) || [],
    datasets: mockPatientProgressData.map((goal, index) => ({
      label: goal.goalName,
      data: goal.data.map(d => d.score),
      borderColor: ['#2563EB', '#059669', '#F59E0B'][index % 3],
      backgroundColor: [`rgba(37, 99, 235, 0.1)`, `rgba(5, 150, 105, 0.1)`, `rgba(245, 158, 11, 0.1)`][index % 3],
      tension: 0.3,
      fill: true,
    })),
  };

  const performanceBarChartData = {
    labels: mockPerformanceCategories.map(c => c.categoryName),
    datasets: [
      {
        label: 'חודש קודם',
        data: mockPerformanceCategories.map(c => c.lastMonthScore),
        backgroundColor: 'rgba(37, 99, 235, 0.6)', // Medical Blue
        borderColor: '#2563EB',
        borderWidth: 1,
      },
      {
        label: 'חודש נוכחי',
        data: mockPerformanceCategories.map(c => c.currentMonthScore),
        backgroundColor: 'rgba(5, 150, 105, 0.6)', // Calm Green
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };
  const chartOptions = (title: string) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { family: "'Assistant', sans-serif", size: 11 } } }, // Use Assistant font
      title: { display: true, text: title, font: { size: 14, family: "'Assistant', sans-serif", weight: '600' } }, // Use Assistant font
      tooltip: { titleFont: { family: "'Assistant', sans-serif" }, bodyFont: { family: "'Assistant', sans-serif" } }
    },
    scales: { 
        y: { beginAtZero: true, max: 100, ticks: { font: { family: "'Assistant', sans-serif" } } },
        x: { ticks: { font: { family: "'Assistant', sans-serif" } } }
    },
  });

  const handleGenerateReport = () => {
    if (!selectedPatient) { alert("יש לבחור מטופל תחילה."); return; }
    console.log("Generating report:", { selectedPatient, reportPeriod, focusAreas, reportTemplate });
    alert(`הפקת דוח "${reportTemplate}" עבור ${selectedPatient.name}. בדוק את הקונסול לפרטים.`);
  };

  const generateCSVData = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Goal Name,Week,Score,Notes\r\n";
    mockPatientProgressData.forEach(goal => {
      goal.data.forEach(point => {
        csvContent += `${goal.goalName.replace(/,/g, '')},${point.week},${point.score},"${point.notes?.replace(/"/g, '""') || ''}"\r\n`;
      });
    });
    return encodeURI(csvContent);
  };
  
  const generateSimpleDocContent = () => {
    let docContent = `<h1>דוח התקדמות עבור ${selectedPatient?.name || 'לא נבחר מטופל'}</h1>`;
    docContent += `<p>תקופת דיווח: ${new Date(reportPeriod.from).toLocaleDateString('he-IL')} - ${new Date(reportPeriod.to).toLocaleDateString('he-IL')}</p>`;
    docContent += `<h2>תחומי התמקדות: ${focusAreas.join(', ')}</h2>`;
    docContent += `<h3>נקודות חוזק:</h3><ul>${mockStrengths.map(s => `<li>${s}</li>`).join('')}</ul>`;
    docContent += `<h3>אתגרים והמלצות:</h3><ul>${mockChallenges.map(c => `<li>${c}</li>`).join('')}</ul>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(docContent)}`;
  };


  const MyPdfDocument = () => (
    <Document title={`דוח התקדמות - ${selectedPatient?.name || ''} - ${reportTemplate}`} author="SpeechTherapyAI">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>דוח התקדמות - {reportTemplate}</Text>
        {selectedPatient && (
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.patientInfo}>שם מטופל: {selectedPatient.name}</Text>
                <Text style={pdfStyles.patientInfo}>גיל: {selectedPatient.age}</Text>
            </View>
        )}
        <Text style={{...pdfStyles.patientInfo, marginBottom: 15}}>תקופת דיווח: {new Date(reportPeriod.from).toLocaleDateString('he-IL')} עד {new Date(reportPeriod.to).toLocaleDateString('he-IL')}</Text>
        
        <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>תחומי התמקדות</Text>
            {focusAreas.map((area, i) => <Text key={i} style={pdfStyles.listItem}>• {area}</Text>)}
        </View>

        <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>התקדמות במטרות</Text>
            {chartImages.lineChart ? 
                (<Image style={pdfStyles.chartImage} src={chartImages.lineChart} />) : 
                (<Text style={pdfStyles.chartPlaceholder}>תרשים התקדמות במטרות אינו זמין.</Text>)
            }
            {mockPatientProgressData.map(goal => (
                <View key={goal.goalId} style={{marginBottom: 8}}>
                    <Text style={{...pdfStyles.text, fontWeight: 'bold'}}>{goal.goalName}</Text>
                    {goal.data.map(p => <Text key={p.week} style={pdfStyles.listItem}>  {p.week}: {p.score}% ({p.notes || 'אין הערות'})</Text>)}
                </View>
            ))}
        </View>

        <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>ביצועים כלליים</Text>
            {chartImages.barChart ? 
                (<Image style={pdfStyles.chartImage} src={chartImages.barChart} />) : 
                (<Text style={pdfStyles.chartPlaceholder}>תרשים ביצועים כלליים אינו זמין.</Text>)
            }
            {mockPerformanceCategories.map(cat => (
                <Text key={cat.categoryName} style={pdfStyles.text}>
                    {cat.categoryName}: חודש קודם - {cat.lastMonthScore}%, חודש נוכחי - {cat.currentMonthScore}%
                </Text>
            ))}
        </View>

        <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>נקודות חוזק</Text>
            {mockStrengths.map((s, i) => <Text key={i} style={pdfStyles.listItem}>• {s}</Text>)}
        </View>
        
        <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>אתגרים והמלצות</Text>
            {mockChallenges.map((c, i) => <Text key={i} style={pdfStyles.listItem}>• {c}</Text>)}
        </View>
      </Page>
    </Document>
  );


  return (
    <div className={styles.pageContainer}>
      <h1>דוחות והתקדמות</h1>
      <section className={styles.section} aria-labelledby="progress-report-heading">
        <h2 id="progress-report-heading">דוח התקדמות עבור: {selectedPatient?.name || 'בחירת מטופל'}</h2>
        <div className={styles.formGroup} style={{marginBottom: '1.5rem', maxWidth: '350px'}}> {/* Increased bottom margin and max-width */}
            <label htmlFor="patientSelectReport">בחר מטופל לצפייה בדוח:</label>
            <select
                id="patientSelectReport"
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                    const patient = patients.find(p => p.id === e.target.value);
                    setSelectedPatient(patient || null);
                }}
                data-tooltip="בחר מטופל להצגת נתוני ההתקדמות שלו"
                aria-describedby="selected-patient-name"
            >
                <option value="" disabled={!!selectedPatient}>בחר מטופל...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {selectedPatient && <span id="selected-patient-name" className="visually-hidden">נבחר מטופל: {selectedPatient.name}</span>}
        </div>

        {selectedPatient ? (
            <>
                <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                    <h3>התקדמות במטרות (שבועי)</h3>
                    <div style={{ height: '300px' }} role="img" aria-label={`תרשים התקדמות במטרות עבור ${selectedPatient.name}`}>
                    <Line ref={lineChartRef} options={chartOptions('התקדמות במטרות לאורך זמן')} data={goalProgressChartData} />
                    </div>
                </div>
                <div className={styles.chartContainer}>
                    <h3>השוואת ביצועים (חודשי)</h3>
                    <div style={{ height: '300px' }} role="img" aria-label={`תרשים השוואת ביצועים עבור ${selectedPatient.name}`}>
                    <Bar ref={barChartRef} options={chartOptions('ביצועים לפי קטגוריות מיומנות')} data={performanceBarChartData} />
                    </div>
                </div>
                </div>
                <div className={styles.summaryPoints}>
                <div className={styles.summaryBox}>
                    <h3>נקודות חוזק</h3>
                    <ul>{mockStrengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div className={styles.summaryBox}>
                    <h3>אתגרים והמלצות</h3>
                    <ul>{mockChallenges.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
                </div>
            </>
        ) : (
            <p>יש לבחור מטופל כדי להציג את דוח ההתקדמות.</p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="custom-report-heading">
        <h2 id="custom-report-heading">יצירת דוחות מותאמים אישית</h2>
        <div className={styles.customReportForm}>
          <div className={styles.formGroup}>
            <label htmlFor="reportFromDate">מתאריך:</label>
            <input type="date" id="reportFromDate" value={reportPeriod.from} onChange={e => setReportPeriod(prev => ({...prev, from: e.target.value}))} data-tooltip="תאריך התחלה לתקופת הדוח" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="reportToDate">עד תאריך:</label>
            <input type="date" id="reportToDate" value={reportPeriod.to} onChange={e => setReportPeriod(prev => ({...prev, to: e.target.value}))} data-tooltip="תאריך סיום לתקופת הדוח" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="reportTemplate">תבנית דוח:</label>
            <select id="reportTemplate" value={reportTemplate} onChange={e => setReportTemplate(e.target.value)} data-tooltip="בחר את סוג הדוח להפקה">
              <option value="דוח להורים">דוח להורים</option>
              <option value="דוח מקצועי">דוח מקצועי (לצוות חינוכי/רפואי)</option>
              <option value="דוח קליני מפורט">דוח קליני מפורט</option>
            </select>
          </div>
          <fieldset className={`${styles.formGroup} ${styles.focusAreas}`}>
            <legend>תחומי התמקדות לדוח (אופציונלי):</legend>
            {mockPatientProgressData.slice(0,3).map(goal => (
                <label key={goal.goalId} data-tooltip={`כלול את מטרה "${goal.goalName}" בדוח`}>
                    <input type="checkbox" value={goal.goalName} checked={focusAreas.includes(goal.goalName)} 
                           onChange={e => {
                               const area = e.target.value;
                               setFocusAreas(prev => e.target.checked ? [...prev, area] : prev.filter(a => a !== area));
                           }}
                    /> {goal.goalName}
                </label>
            ))}
          </fieldset>
        </div>
        <div className={styles.reportActions}>
          <button onClick={handleGenerateReport} className={`${styles.actionButton} ${styles.generateReport}`} data-tooltip="הצג תצוגה מקדימה של הדוח לפני ייצוא">
            {/* <FaChartLine /> */} הפק דוח (תצוגה מקדימה)
          </button>
          <PDFDownloadLink 
              document={<MyPdfDocument />} 
              fileName={`report_${selectedPatient?.name.replace(' ','_') || 'general'}_${reportTemplate.replace(' ','_')}.pdf`}
              className={`${styles.actionButton} ${styles.exportPdf} ${(pdfLoadingMessage || !selectedPatient) ? styles.disabled : ''}`}
              aria-disabled={!!(pdfLoadingMessage || !selectedPatient)}
              data-tooltip="הורד את הדוח המלא כקובץ PDF"
          >
            {({ loading }) => {
                const message = loading ? 'מכין PDF...' : (pdfLoadingMessage ? pdfLoadingMessage : (!selectedPatient ? 'בחר מטופל לייצוא' : 'ייצא לPDF'));
                return <> {/* <FaFilePdf /> */} {message} </>;
            }}
          </PDFDownloadLink>
           <a 
            href={generateSimpleDocContent()} 
            download={`report_${selectedPatient?.name.replace(' ','_') || 'general'}.html`}
            className={`${styles.actionButton} ${styles.exportDoc} ${!selectedPatient ? styles.disabled : ''}`}
            aria-disabled={!selectedPatient}
            data-tooltip="הורד סיכום פשוט כקובץ HTML (ניתן לפתיחה ב-Word)"
          >
            {/* <FaFileWord /> */} ייצא לWord (HTML)
          </a>
          <a 
            href={generateCSVData()} 
            download={`progress_data_${selectedPatient?.name.replace(' ','_') || 'general'}.csv`}
            className={`${styles.actionButton} ${styles.exportCsv} ${!selectedPatient ? styles.disabled : ''}`}
            aria-disabled={!selectedPatient}
            data-tooltip="הורד נתוני התקדמות גולמיים כקובץ CSV"
          >
            {/* <FaFileCsv /> */} ייצא נתונים לCSV
          </a>
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
