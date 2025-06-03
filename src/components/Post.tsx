import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { PostDto } from "@/app/dtos/postDto";

interface PostProps {
  post: PostDto;
  onDelete?: (id: number, e: React.MouseEvent) => void;
  onClick?: (id: number) => void;
  showDelete?: boolean;
}

const Post: React.FC<PostProps> = ({ post, onDelete, onClick, showDelete }) => (
  <Card
    bg="secondary"
    text="light"
    className="shadow-sm h-100"
    style={{ cursor: onClick ? "pointer" : "default", position: "relative" }}
    onClick={onClick ? () => onClick(post.id) : undefined}
  >
    {showDelete && onDelete && (
      <Button
        variant="danger"
        size="sm"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(post.id, e);
        }}
      >
        Delete
      </Button>
    )}
    <Card.Body>
      <Card.Title>{post.content}</Card.Title>
      {post.media && post.media.length > 0 && (
        <div className="mb-3">
          {post.media.map((media) => (
            <div key={media.id} className="mb-2">
              {media.type === "VIDEO" ? (
                <iframe
                  src={media.url}
                  title={media.title || "Video"}
                  width="100%"
                  height="315"
                  frameBorder="0"
                  allowFullScreen
                  style={{ borderRadius: "8px", maxWidth: "560px" }}
                />
              ) : (
                <img
                  src={media.url}
                  alt={media.title || "Image"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                  }}
                />
              )}
              {media.title && (
                <div className="text-light small mt-1">{media.title}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <Card.Subtitle className="mb-2 text-light small">
        Posted by: {post.userEmail} on {new Date(post.creationDate).toLocaleString()}
      </Card.Subtitle>
      <div className="mt-2">
        {post.tags.map((tag) => (
          <Badge bg="info" key={tag.id} className="me-2">
            {tag.name}
          </Badge>
        ))}
      </div>
      <div
        className="mt-2"
        style={{ fontWeight: 500, color: "#0dcaf0", fontSize: 16 }}
      >
        <span role="img" aria-label="like">
          👍
        </span>{" "}
        {post.likes} {post.likes === 1 ? "Like" : "Likes"}
      </div>
    </Card.Body>
  </Card>
);

export default Post;