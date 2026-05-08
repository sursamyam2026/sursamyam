const SectionDivider = () => {
  return (
    <div className="relative py-4 lg:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          {/* Left line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border/50" />
          
          {/* Center decorative element */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-gold" />
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          </div>
          
          {/* Right line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border/50" />
        </div>
      </div>
    </div>
  );
};

export default SectionDivider;
