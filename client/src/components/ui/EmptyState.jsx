const EmptyState = ({ title = 'No records found', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
    </svg>
    <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
