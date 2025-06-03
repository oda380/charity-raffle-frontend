// src/components/Card.jsx
export default function Card({ children, title, className = "", titleClassName = "" }) {
  return (
    <section
      className={`bg-content-bg dark:bg-dark-content-bg shadow-soft rounded-xl p-6 w-full ${className}`}
    >
      {title && (
        <h2
          className={`text-xl font-headings text-indigo-600 dark:text-indigo-400 mb-4 ${titleClassName}`}
        >
          {title}
        </h2>
      )}
      {/* If children already have spacing, you might not need this inner div,
          but it's good for ensuring consistent spacing for direct children of the card. */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}