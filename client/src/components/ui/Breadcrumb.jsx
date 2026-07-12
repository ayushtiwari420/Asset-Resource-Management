import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500">
    {items.map((item, index) => (
      <span key={index} className="flex items-center gap-1">
        {index > 0 && <span className="text-gray-300">/</span>}
        {item.href ? (
          <Link to={item.href} className="hover:text-gray-900 transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-900 font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
