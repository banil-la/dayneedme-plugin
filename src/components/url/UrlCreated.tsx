import { h } from "preact";

export default function UrlCreated({ shortUrl }: { shortUrl: string }) {
  return (
    <p>
      ✅{" "}
      <a
        className="font-medium text-blue-600 underline"
        href={shortUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {shortUrl}
      </a>
    </p>
  );
}
