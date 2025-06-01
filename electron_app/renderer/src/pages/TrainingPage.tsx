import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'http://localhost:3001/api'; // Node.js backend

interface TrainingJobStatus {
  job_id: string;
  model_type: string;
  status: string;
  progress: number;
  message: string;
  last_updated?: number; // from Python backend
}

interface ModelTrainingState {
  jobId: string | null;
  status: string | null;
  progress: number;
  message: string | null;
  error: string | null;
  isTraining: boolean; // To disable button
}

const TrainingPage: React.FC = () => {
  const [speechModel, setSpeechModel] = useState<ModelTrainingState>({
    jobId: null, status: null, progress: 0, message: 'No active training job.', error: null, isTraining: false
  });
  const [languageModel, setLanguageModel] = useState<ModelTrainingState>({
    jobId: null, status: null, progress: 0, message: 'No active training job.', error: null, isTraining: false
  });

  // Use refs for intervals to manage them correctly across re-renders
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const languageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollStatus = async (modelType: 'speech' | 'language', jobId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/training/status/${jobId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get status for job ${jobId}`);
      }
      const statusData: TrainingJobStatus = await response.json();

      const updateState = modelType === 'speech' ? setSpeechModel : setLanguageModel;

      updateState(prevState => ({
        ...prevState,
        jobId: statusData.job_id,
        status: statusData.status,
        progress: statusData.progress,
        message: statusData.message,
        error: null, // Clear previous errors on successful poll
      }));

      if (statusData.status === 'completed' || statusData.status === 'failed') {
        const intervalRef = modelType === 'speech' ? speechIntervalRef : languageIntervalRef;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        updateState(prevState => ({ ...prevState, isTraining: false }));
        // Potentially update dummy "Last Training" and "Accuracy" here
        if (statusData.status === 'completed') {
            // Example: Update dummy stats
            // setDummyAccuracy(prev => prev + 1); // Just an example
        }
      }
    } catch (err: any) {
      console.error(`Error polling status for ${modelType} job ${jobId}:`, err);
      const updateState = modelType === 'speech' ? setSpeechModel : setLanguageModel;
      updateState(prevState => ({
        ...prevState,
        error: err.message || `Error polling status for ${jobId}.`,
        // Optionally stop polling on repeated errors, or implement backoff
      }));
      // Consider stopping polling if job ID becomes invalid or too many errors
      // const intervalRef = modelType === 'speech' ? speechIntervalRef : languageIntervalRef;
      // if (intervalRef.current) {
      //    clearInterval(intervalRef.current);
      //    intervalRef.current = null;
      // }
      // updateState(prevState => ({ ...prevState, isTraining: false, message: "Polling failed." }));
    }
  };

  const handleStartTraining = async (modelType: 'speech' | 'language') => {
    const updateState = modelType === 'speech' ? setSpeechModel : setLanguageModel;
    const intervalRef = modelType === 'speech' ? speechIntervalRef : languageIntervalRef;

    // Clear any existing interval for this model type
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    updateState({
      jobId: null, status: 'initiating', progress: 0,
      message: `Starting ${modelType} model training...`, error: null, isTraining: true
    });

    try {
      const response = await fetch(`${API_BASE_URL}/training/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_type: modelType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to start ${modelType} training.`);
      }
      const jobData: TrainingJobStatus = await response.json();

      updateState(prevState => ({
        ...prevState,
        jobId: jobData.job_id,
        status: jobData.status,
        progress: jobData.progress,
        message: jobData.message || `Training job ${jobData.job_id} started.`,
      }));

      // Start polling
      intervalRef.current = setInterval(() => pollStatus(modelType, jobData.job_id), 3000); // Poll every 3 seconds

    } catch (err: any) {
      console.error(`Error starting ${modelType} training:`, err);
      updateState({
        jobId: null, status: 'failed', progress: 0,
        message: `Failed to start ${modelType} training.`, error: err.message, isTraining: false
      });
    }
  };

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      if (languageIntervalRef.current) clearInterval(languageIntervalRef.current);
    };
  }, []);


  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">AI Model Training Center</h1>
        <p className="text-lg text-gray-600 mt-2">Manage and train your custom AI models.</p>
      </header>

      {/* Speech Recognition Model Training Section */}
      <section className="p-6 bg-white rounded-xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6 border-b-2 border-indigo-100 pb-3">
          אימון מודל התמלול (Speech Recognition Model Training)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Data Manager */}
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Training Data:</h3>
            <div>
              <label htmlFor="speechAudioSamples" className="block text-sm font-medium text-gray-600 mb-1">
                Upload Audio Samples (WAV, MP3):
              </label>
              <input
                type="file"
                id="speechAudioSamples"
                multiple
                disabled={speechModel.isTraining}
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-indigo-200 file:text-indigo-700
                           hover:file:bg-indigo-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Upload new audio samples for training or fine-tuning the speech model.</p>
            </div>
            <button
              onClick={() => handleStartTraining('speech')}
              disabled={speechModel.isTraining}
              className="w-full px-4 py-2.5 text-white font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {speechModel.isTraining ? `Training (${speechModel.progress.toFixed(0)}%)...` : 'Start Speech Model Training'}
            </button>
          </div>

          {/* Model Status Panel */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Model Status:</h3>
            {speechModel.error && <p className="text-sm text-red-500">Error: {speechModel.error}</p>}
            {speechModel.message && <p className="text-sm text-gray-600">{speechModel.message}</p>}
            {speechModel.jobId && <p className="text-xs text-gray-500">Job ID: {speechModel.jobId}</p>}
            {speechModel.isTraining && speechModel.status !== 'completed' && speechModel.status !== 'failed' && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${speechModel.progress}%` }}></div>
              </div>
            )}
            {/* Dummy placeholders for actual stats */}
            <p className="text-sm text-gray-600 pt-2">Current Accuracy: <span className="font-semibold text-green-600">92.5%</span> (dummy)</p>
            <p className="text-sm text-gray-600">Last Training: <span className="font-semibold">5 days ago</span> (dummy)</p>
          </div>
        </div>
      </section>

      {/* Language Model Fine-tuning Section */}
      <section className="p-6 bg-white rounded-xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6 border-b-2 border-teal-100 pb-3">
          אימון מודל השפה (Language Model Fine-tuning)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Data Manager */}
          <div className="space-y-4 p-4 bg-teal-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Fine-tuning Data:</h3>
            <div>
              <label htmlFor="languageTextCorpus" className="block text-sm font-medium text-gray-600 mb-1">
                Upload Professional Documents/Text Corpus (TXT, DOCX):
              </label>
              <input
                type="file"
                id="languageTextCorpus"
                multiple
                disabled={languageModel.isTraining}
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-teal-200 file:text-teal-700
                           hover:file:bg-teal-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Upload domain-specific texts to adapt the language model.</p>
            </div>
            <button
              onClick={() => handleStartTraining('language')}
              disabled={languageModel.isTraining}
              className="w-full px-4 py-2.5 text-white font-semibold bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {languageModel.isTraining ? `Fine-tuning (${languageModel.progress.toFixed(0)}%)...` : 'Start Language Model Fine-tuning'}
            </button>
          </div>

          {/* Model Status Panel */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Model Status:</h3>
            {languageModel.error && <p className="text-sm text-red-500">Error: {languageModel.error}</p>}
            {languageModel.message && <p className="text-sm text-gray-600">{languageModel.message}</p>}
            {languageModel.jobId && <p className="text-xs text-gray-500">Job ID: {languageModel.jobId}</p>}
            {languageModel.isTraining && languageModel.status !== 'completed' && languageModel.status !== 'failed' && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${languageModel.progress}%` }}></div>
              </div>
            )}
            {/* Dummy placeholders for actual stats */}
            <p className="text-sm text-gray-600 pt-2">Domain Adaptation Score: <span className="font-semibold text-green-600">85%</span> (dummy)</p>
            <p className="text-sm text-gray-600">Last Fine-tuning: <span className="font-semibold">2 weeks ago</span> (dummy)</p>
          </div>
        </div>
      </section>

      {/* Model Quality Assurance Section */}
      <section className="p-6 bg-white rounded-xl shadow-xl border border-gray-200 mt-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4">
          Model Quality Assurance
        </h2>

        {/* Speech Model Evaluation */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-5">
            Speech Model Evaluation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-indigo-50 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-700">Key Metrics:</h4>
              <p className="text-sm text-gray-600">Word Error Rate (WER): <span className="font-semibold text-indigo-600">12.5%</span> (dummy)</p>
              <p className="text-sm text-gray-600">Transcription Speed (RTF): <span className="font-semibold text-indigo-600">0.8</span> (dummy)</p>
              <p className="text-sm text-gray-600">Diarization Accuracy (DER): <span className="font-semibold text-indigo-600">15.2%</span> (dummy)</p>
            </div>
            <div className="flex flex-col justify-center p-4 bg-gray-50 rounded-lg shadow">
              <button
                onClick={() => {
                  console.log("Evaluate Speech Model button clicked - functionality not implemented yet.");
                  alert("Speech Model Evaluation functionality is a placeholder.");
                }}
                className="w-full px-4 py-3 text-white font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Evaluate Speech Model on Test Set
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Uses a predefined internal test set for comprehensive evaluation.</p>
            </div>
          </div>
        </div>

        {/* Language Model (LLM/NLP) Evaluation */}
        <div>
          <h3 className="text-2xl font-semibold text-teal-700 mb-5">
            Language Model Evaluation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-teal-50 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-700">Key Metrics:</h4>
              <p className="text-sm text-gray-600">Summarization ROUGE-L: <span className="font-semibold text-teal-600">0.45</span> (dummy)</p>
              <p className="text-sm text-gray-600">NER F1-Score (Clinical Terms): <span className="font-semibold text-teal-600">0.82</span> (dummy)</p>
              <p className="text-sm text-gray-600">Intent Accuracy (Commands/Queries): <span className="font-semibold text-teal-600">91%</span> (dummy)</p>
              <p className="text-sm text-gray-600">Semantic Search Relevance (NDCG@5): <span className="font-semibold text-teal-600">0.78</span> (dummy)</p>
            </div>
            <div className="flex flex-col justify-center p-4 bg-gray-50 rounded-lg shadow">
              <button
                onClick={() => {
                  console.log("Evaluate Language Model button clicked - functionality not implemented yet.");
                  alert("Language Model Evaluation functionality is a placeholder.");
                }}
                className="w-full px-4 py-3 text-white font-semibold bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Evaluate Language Model on Test Set
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Evaluates summarization, NER, intent recognition, and search relevance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* (Optional) NER Model Training Section - Can be added later if needed, following the same pattern */}
      {/*
      <section className="p-6 bg-white rounded-xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-semibold text-orange-700 mb-6 border-b-2 border-orange-100 pb-3">
          אימון מודל זיהוי ישויות (NER Model Training)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">NER Training Data:</h3>
            <div>
              <label htmlFor="annotatedData" className="block text-sm font-medium text-gray-600 mb-1">
                Upload Annotated Data (JSON, CoNLL):
              </label>
              <input
                type="file"
                id="annotatedData"
                multiple
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-orange-200 file:text-orange-700
                           hover:file:bg-orange-300"
              />
              <p className="text-xs text-gray-500 mt-1">Upload data with annotated entities for training the NER model.</p>
            </div>
            <button
              className="w-full px-4 py-2.5 text-white font-semibold bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Start NER Model Training
            </button>
          </div>
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">NER Model Status:</h3>
            <p className="text-sm text-gray-600">F1-Score (Overall): <span className="font-semibold text-green-600">88.2%</span> (dummy)</p>
            <p className="text-sm text-gray-600">Last Training: <span className="font-semibold">1 month ago</span> (dummy)</p>
            <div className="flex space-x-2 pt-3">
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">Retrain NER</button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">Evaluate NER</button>
            </div>
          </div>
        </div>
      </section>
      */}
    </div>
  );
};

export default TrainingPage;
