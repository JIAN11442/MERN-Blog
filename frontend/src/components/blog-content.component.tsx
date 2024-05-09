import hljs from "highlight.js";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { OutputBlockData } from "@editorjs/editorjs";

interface BlogContentProps {
  block: OutputBlockData;
}

const BlogContent: React.FC<BlogContentProps> = ({ block }) => {
  const { type, data } = block;

  // Paragraph
  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }

  // Header
  if (type === "header") {
    if (data.level === 4) {
      return <h4 dangerouslySetInnerHTML={{ __html: data.text }}></h4>;
    } else if (data.level === 3) {
      return <h3 dangerouslySetInnerHTML={{ __html: data.text }}></h3>;
    } else if (data.level === 2) {
      return <h2 dangerouslySetInnerHTML={{ __html: data.text }}></h2>;
    } else {
      return <h1 dangerouslySetInnerHTML={{ __html: data.text }}></h1>;
    }
  }

  // Code
  if (type === "code") {
    let detectedLanguage = hljs.highlightAuto(data.code).language;

    // Fixing some languages
    const languages = ["dsconfig", "mipsasm", "routeros"];
    if (detectedLanguage && languages.includes(detectedLanguage)) {
      detectedLanguage = "csharp";
    }

    return (
      <SyntaxHighlighter
        language={detectedLanguage}
        showLineNumbers={true}
        codeTagProps={{ style: { fontFamily: "Comic Sans" } }}
      >
        {data.code}
      </SyntaxHighlighter>
    );
  }

  // Image
  if (type === "image") {
    const url = data.file.url;
    const caption = data.caption;

    return (
      <div>
        <img src={url} />
        {caption.length ? (
          <p
            className="
            block
            text-center
            my-3
            md:mb-12
            text-base
            text-grey-dark/50
          "
          >
            {caption}
          </p>
        ) : (
          ""
        )}
      </div>
    );
  }

  // Quote
  if (type === "quote") {
    const quote = data.text;
    const caption = data.caption;

    return (
      <div
        className="
          p-5
          pl-5
          bg-[#fbf3db]
          border-l-4
          border-[#fbcf4a]
          rounded-r-md
        "
      >
        <p
          className="
            font-mono
            max-md:text-[15px]
            max-md:leading-6 
            md:text-[16px]
            md:leading-8
            lg:text-[17px]
          "
        >
          {quote}
        </p>
        {caption.length ? (
          <p
            className="
              w-full
              text-[#fbb74a]
              text-base
            "
          >
            {caption}
          </p>
        ) : (
          ""
        )}
      </div>
    );
  }

  // List
  if (type === "list") {
    const style = data.style;
    const items = data.items;

    return (
      <ol
        className={`
          pl-10
          ${style === "ordered" ? "list-decimal" : "list-disc"}
        `}
      >
        {items.map((listItem: string[], i: number) => {
          return (
            <li
              key={i}
              className="my-4"
              dangerouslySetInnerHTML={{ __html: listItem }}
            ></li>
          );
        })}
      </ol>
    );
  }
};

export default BlogContent;
