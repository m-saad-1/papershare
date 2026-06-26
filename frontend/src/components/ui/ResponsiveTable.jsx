import React from 'react';

/**
 * ResponsiveTable Component
 *
 * A flexible table component with two responsive variants:
 * - 'scroll': Horizontal scroll on mobile (good for data-heavy tables)
 * - 'stack': Converts to cards on mobile (good for simpler data)
 *
 * @param {Array} columns - Column definitions [{ key, label, className, render }]
 * @param {Array} data - Array of data objects
 * @param {function} renderRow - Function to render each row (for custom layouts)
 * @param {string} variant - 'scroll' | 'stack'
 * @param {string} className - Additional CSS classes
 * @param {boolean} striped - Whether to show striped rows
 * @param {boolean} hoverable - Whether rows should highlight on hover
 * @param {React.ReactNode} emptyState - Content to show when data is empty
 * @param {boolean} loading - Whether the table is loading
 * @param {number} skeletonRows - Number of skeleton rows to show when loading
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  renderRow,
  variant = 'scroll',
  className = '',
  striped = false,
  hoverable = true,
  emptyState = null,
  loading = false,
  skeletonRows = 5,
}) => {
  // Stacked variant - converts to cards on mobile
  if (variant === 'stack') {
    return (
      <div className={`${className}`}>
        {/* Desktop header - hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          {columns.map((col) => (
            <div
              key={col.key}
              className={`text-xs font-semibold text-gray-600 uppercase tracking-wide ${col.headerClassName || col.className || ''}`}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <div
                key={index}
                className="p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center"
              >
                {columns.map((col) => (
                  <div key={col.key} className={col.className || ''}>
                    <div className="skeleton-text mb-2 sm:mb-0" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {emptyState || 'No data available'}
          </div>
        )}

        {/* Data rows */}
        {!loading && data.length > 0 && (
          <div className="divide-y divide-gray-100 sm:divide-y">
            {data.map((item, index) => {
              if (renderRow) {
                return (
                  <div
                    key={item._id || item.id || index}
                    className={`
                      card mb-3 p-4 sm:mb-0 sm:rounded-none sm:border-x-0 sm:border-t-0 sm:shadow-none sm:bg-transparent
                      ${hoverable ? 'sm:hover:bg-gray-50' : ''}
                      ${striped && index % 2 === 1 ? 'sm:bg-gray-50' : ''}
                    `}
                  >
                    {renderRow(item, index)}
                  </div>
                );
              }

              return (
                <div
                  key={item._id || item.id || index}
                  className={`
                    card mb-3 p-4 sm:mb-0 sm:rounded-none sm:border-x-0 sm:border-t-0 sm:shadow-none sm:bg-transparent
                    sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center sm:py-4 sm:px-4
                    ${hoverable ? 'sm:hover:bg-gray-50' : ''}
                    ${striped && index % 2 === 1 ? 'sm:bg-gray-50' : ''}
                  `}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={`py-1 sm:py-0 ${col.className || ''}`}
                    >
                      {/* Mobile label */}
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:hidden block mb-1">
                        {col.label}
                      </span>
                      {/* Value */}
                      <span className="text-gray-900">
                        {col.render ? col.render(item[col.key], item, index) : item[col.key]}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Scroll variant - horizontal scroll on mobile
  return (
    <div className={`table-responsive ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide ${col.headerClassName || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {/* Loading state */}
          {loading && Array.from({ length: skeletonRows }).map((_, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4">
                  <div className="skeleton-text" />
                </td>
              ))}
            </tr>
          ))}

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyState || 'No data available'}
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading && data.map((item, index) => {
            if (renderRow) {
              return renderRow(item, index);
            }

            return (
              <tr
                key={item._id || item.id || index}
                className={`
                  ${hoverable ? 'hover:bg-gray-50' : ''}
                  ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-4 text-sm text-gray-900 ${col.className || ''}`}
                  >
                    {col.render ? col.render(item[col.key], item, index) : item[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * DataList - A simpler mobile-first data display component
 * Good for key-value pairs and simple data
 */
export const DataList = ({
  items = [], // [{ label, value, className }]
  className = '',
}) => {
  return (
    <dl className={`divide-y divide-gray-100 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row sm:items-center py-3 gap-1 sm:gap-4"
        >
          <dt className="text-sm font-medium text-gray-500 sm:w-1/3 sm:flex-shrink-0">
            {item.label}
          </dt>
          <dd className={`text-sm text-gray-900 sm:flex-1 ${item.className || ''}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default ResponsiveTable;
