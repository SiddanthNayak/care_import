interface ImportsPlaceholderProps {
  title: string;
  description?: string;
}

export default function ImportsPlaceholder({
  title,
  description,
}: ImportsPlaceholderProps) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600 mt-2">
        {description || "This importer will be available soon."}
      </p>
    </div>
  );
}
