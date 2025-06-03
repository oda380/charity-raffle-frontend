export default function InfoCard({ title, children }) {
  return (
    <div className="bg-white/80 dark:bg-indigo-950/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/30 dark:border-indigo-800 text-center space-y-2">
      <h3 className="text-lg font-fun text-indigo-600 dark:text-indigo-300">{title}</h3>
      {children}
    </div>
  );
}
