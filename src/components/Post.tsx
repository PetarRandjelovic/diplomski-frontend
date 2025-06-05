import React from "react";
import { PostDto } from "@/app/dtos/postDto";

interface PostProps {
  post: PostDto;
  onDelete?: (id: number, e: React.MouseEvent) => void;
  onClick?: (id: number) => void;
  showDelete?: boolean;
  showLikes?: boolean;
}

const isImage = (url: string) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);
const isYouTube = (url: string) => {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/.test(url);
};
const getYouTubeId = (url: string) => {
  // Support youtube.com/watch?v=, youtu.be/, youtube.com/embed/
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
};

const Post: React.FC<PostProps> = ({ post, onDelete, onClick, showDelete, showLikes }) => {
  console.log(post);
  return (
    <div
      className="bg-gray-800 text-gray-100 rounded-xl shadow-lg p-6 mb-4 transition hover:shadow-2xl cursor-pointer border border-gray-700"
      onClick={onClick ? () => onClick(post.id) : undefined}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg text-primary-400">{post.username}</div>
        {showDelete && (
          <button
            className="ml-2 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
            onClick={e => {
              e.stopPropagation();
              onDelete && onDelete(post.id, e);
            }}
          >
            Delete
          </button>
        )}
      </div>
      <div className="mb-1 text-xs text-gray-400">{new Date(post.creationDate).toLocaleString()}</div>
      <div className="mb-3 text-base leading-relaxed break-words">
        {post.content}
      </div>
      {/* Media rendering */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3 flex flex-col gap-4">
          {post.media.map((item, idx) => (
            <div key={item.id || idx} className="flex flex-col items-start w-full">
              {item.type === 'IMAGE' && (
                <img src={item.url} alt={item.title || "media"} className="max-w-full max-h-64 rounded mb-1 border border-gray-700" />
              )}
              {item.type === 'VIDEO' && isYouTube(item.url) && getYouTubeId(item.url) && (
                <div className="aspect-w-16 aspect-h-9 w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(item.url)}`}
                    title={item.title || "YouTube video"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded mb-1 border border-gray-700 w-full h-full"
                  />
                </div>
              )}
              {item.type === 'VIDEO' && !isYouTube(item.url) && isVideo(item.url) && (
                <video controls className="max-w-full max-h-64 rounded mb-1 border border-gray-700">
                  <source src={item.url} />
                  Your browser does not support the video tag.
                </video>
              )}
              {item.title && <div className="text-xs text-gray-400 mt-1">{item.title}</div>}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {post.tags && post.tags.map(tag => (
          <span key={tag.id} className="bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">{tag.name}</span>
        ))}
      </div>
      {showLikes && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary-400 text-lg">👍</span>
          <span className="font-semibold text-gray-200">{post.likes} {post.likes === 1 ? "Like" : "Likes"}</span>
        </div>
      )}
    </div>
  );
};

export default Post;