/**
 * PostCardSkeleton
 * Soft shimmer placeholder that matches the real PostCard footprint
 * so the feed doesn't jump as content streams in.
 */
function PostCardSkeleton({ withThumb = true }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      {/* author */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-3 rounded skeleton" />
          <div className="w-20 h-2.5 rounded skeleton" />
        </div>
        <div className="w-16 h-7 rounded-lg skeleton" />
      </div>

      {/* body */}
      <div className="px-5 pb-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="w-16 h-5 rounded-md skeleton" />
          <div className="w-14 h-5 rounded-md skeleton" />
        </div>
        <div className="w-3/4 h-5 rounded skeleton" />
        <div className="w-full h-3.5 rounded skeleton" />
        <div className="w-5/6 h-3.5 rounded skeleton" />
      </div>

      {/* thumbnail */}
      {withThumb && (
        <div className="px-5 pb-4">
          <div className="aspect-[16/9] w-full rounded-xl skeleton" />
        </div>
      )}

      {/* engagement bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-2">
          <div className="w-12 h-7 rounded-lg skeleton" />
          <div className="w-12 h-7 rounded-lg skeleton" />
          <div className="w-12 h-7 rounded-lg skeleton" />
        </div>
        <div className="w-12 h-5 rounded skeleton" />
      </div>
    </div>
  )
}

/** Render N skeleton cards. */
export function PostCardSkeletonList({ count = 3, withThumb = true }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} withThumb={withThumb && i % 2 === 0} />
      ))}
    </div>
  )
}

export default PostCardSkeleton
