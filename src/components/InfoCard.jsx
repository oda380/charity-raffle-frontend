// src/components/InfoCard.jsx

export default function InfoCard({ title, children, className = "" }) {
  return (
    <div
      className={`
        bg-white/80 dark:bg-indigo-950/85 backdrop-blur-md 
        rounded-xl shadow-soft border border-white/40 dark:border-indigo-800/60 
        p-4 text-center space-y-2 
        ${className}
      `}
      // Notes on changes:
      // - bg-indigo-950/85: Slightly increased opacity for dark mode for better text contrast if needed.
      // - backdrop-blur-md: Slightly increased blur for a more pronounced effect.
      // - rounded-xl: Matched to the general Card.jsx rounding for consistency. (rounded-2xl is also fine if you prefer larger rounding for this specific card type).
      // - shadow-soft: Using the custom theme shadow for consistency.
      // - border-white/40 dark:border-indigo-800/60: Adjusted border opacities.
      // - p-4: Kept as is for a more compact card.
    >
      {title && ( // Conditionally render title if provided
        <h3 className="text-lg font-headings text-indigo-600 dark:text-indigo-300">
          {/* Ensure font-fun is mapped to font-headings in tailwind.config.js */}
          {/* Indigo colors are good accents. Ensure these are your chosen theme accents. */}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}