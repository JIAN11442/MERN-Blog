import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { common, createLowlight } from "lowlight";

import "../tools/code/styles.css";

interface TiptapCodeBlockProps {
  className?: string;
  contentRef?: (node: HTMLElement | null) => void;
}

const TiptapCodeBlock: React.FC<TiptapCodeBlockProps> = ({ contentRef }) => {
  const lowlight = createLowlight(common);

  const tiptapEditor = useEditor({
    extensions: [StarterKit, CodeBlockLowlight.configure({ lowlight })],
  });

  useEffect(() => {
    tiptapEditor?.chain().toggleCodeBlock().run();
  }, [tiptapEditor]);

  return <EditorContent editor={tiptapEditor} />;
};

export default TiptapCodeBlock;
