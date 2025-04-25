function AnalysisResults({ data }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Parsed Resume Data</h2>
      <div className="space-y-2">
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Name:</span> {data.name}
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Email:</span> {data.email}
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Skills:</span> {data.skills.join(', ')}
        </p>
      </div>
      <details className="border border-gray-200 rounded-lg">
        <summary className="p-4 cursor-pointer hover:bg-gray-50">
          Raw Text Preview
        </summary>
        <pre className="p-4 bg-gray-50 rounded-b-lg overflow-auto max-h-60 text-sm text-gray-600">
          {data.raw_text}
        </pre>
      </details>
    </div>
  );
}

export default AnalysisResults;