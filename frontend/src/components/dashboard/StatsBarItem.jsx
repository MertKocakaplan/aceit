/**
 * Stats Bar Item Component
 * Displays a single statistic in the stats bar
 */
const StatsBarItem = ({ icon: Icon, label, value, unit, loading }) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-secondary-200" />
        <p className="text-sm font-medium text-secondary-200/90 font-sans">{label}</p>
      </div>
      {loading ? (
        <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
      ) : (
        <p className="text-5xl font-normal text-white font-display tracking-wide">
          {value}
          <span className="text-xl text-secondary-100 ml-2 font-normal font-serif">{unit}</span>
        </p>
      )}
    </div>
  );
};

export default StatsBarItem;
