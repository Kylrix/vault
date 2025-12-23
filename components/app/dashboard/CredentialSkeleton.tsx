export default function CredentialSkeleton() {
  return (
    <div className="rounded-3xl overflow-visible mb-3 backdrop-blur-md border-2 border-border shadow-resting bg-card/50 animate-pulse">
      <div className="flex items-center px-4 py-4">
        <div className="flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-muted/20 border-2 border-border"></div>
        </div>

        <div className="flex-1 ml-4 min-w-0">
          <div className="h-4 bg-muted/20 rounded w-32 mb-2"></div>
          <div className="h-3 bg-muted/20 rounded w-24"></div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-9 h-9 bg-muted/20 rounded-full"></div>
            <div className="w-9 h-9 bg-muted/20 rounded-full"></div>
            <div className="w-9 h-9 bg-muted/20 rounded-full"></div>
            <div className="w-9 h-9 bg-muted/20 rounded-full"></div>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <div className="w-10 h-10 bg-muted/20 rounded-full"></div>
            <div className="w-10 h-10 bg-muted/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
