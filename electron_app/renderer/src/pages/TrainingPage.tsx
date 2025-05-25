import React from 'react';

const TrainingPage: React.FC = () => {
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
          {/* Training Data Manager (Placeholder) */}
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Training Data:</h3>
            <div>
              <label htmlFor="audioSamples" className="block text-sm font-medium text-gray-600 mb-1">
                Upload Audio Samples (WAV, MP3):
              </label>
              <input
                type="file"
                id="audioSamples"
                multiple
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-indigo-200 file:text-indigo-700
                           hover:file:bg-indigo-300"
              />
              <p className="text-xs text-gray-500 mt-1">Upload new audio samples for training or fine-tuning the speech model.</p>
            </div>
            <button
              className="w-full px-4 py-2.5 text-white font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Start Speech Model Training
            </button>
          </div>

          {/* Model Status Panel (Placeholder) */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Model Status:</h3>
            <p className="text-sm text-gray-600">Current Accuracy: <span className="font-semibold text-green-600">92.5%</span> (dummy)</p>
            <p className="text-sm text-gray-600">Last Training: <span className="font-semibold">5 days ago</span> (dummy)</p>
            <p className="text-sm text-gray-600">Dataset Size: <span className="font-semibold">1,250 hours</span> (dummy)</p>
            <div className="flex space-x-2 pt-3">
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">Retrain</button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">Test Model</button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">Reset Model</button>
            </div>
          </div>
        </div>
      </section>

      {/* Language Model Fine-tuning Section */}
      <section className="p-6 bg-white rounded-xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6 border-b-2 border-teal-100 pb-3">
          אימון מודל השפה (Language Model Fine-tuning)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Data Manager (Placeholder) */}
          <div className="space-y-4 p-4 bg-teal-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Fine-tuning Data:</h3>
            <div>
              <label htmlFor="textCorpus" className="block text-sm font-medium text-gray-600 mb-1">
                Upload Professional Documents/Text Corpus (TXT, DOCX):
              </label>
              <input
                type="file"
                id="textCorpus"
                multiple
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-teal-200 file:text-teal-700
                           hover:file:bg-teal-300"
              />
              <p className="text-xs text-gray-500 mt-1">Upload domain-specific texts to adapt the language model.</p>
            </div>
            <button
              className="w-full px-4 py-2.5 text-white font-semibold bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Start Language Model Fine-tuning
            </button>
          </div>

          {/* Model Status Panel (Placeholder) */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Model Status:</h3>
            <p className="text-sm text-gray-600">Domain Adaptation Score: <span className="font-semibold text-green-600">85%</span> (dummy)</p>
            <p className="text-sm text-gray-600">Last Fine-tuning: <span className="font-semibold">2 weeks ago</span> (dummy)</p>
            <p className="text-sm text-gray-600">Perplexity: <span className="font-semibold">45.8</span> (dummy)</p>
            <div className="flex space-x-2 pt-3">
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">Fine-tune</button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">Validate</button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 transition-colors">Export Model</button>
            </div>
          </div>
        </div>
      </section>

      {/* (Optional) NER Model Training Section - Can be added later if needed */}
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
