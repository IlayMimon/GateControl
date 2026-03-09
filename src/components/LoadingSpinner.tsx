function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" opacity="0.15" />
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray="56 44" />
      </svg>
    </div>
  );
}

export default LoadingSpinner;
